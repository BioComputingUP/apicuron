import {Component, OnInit, ViewChild} from '@angular/core';
import {InternalService} from '../services/internal.service';
import {concat, BehaviorSubject, Observable, combineLatest} from 'rxjs';
import {ProgressbarConfig} from 'ngx-bootstrap';
import {HttpEvent, HttpClient, HttpRequest, HttpEventType, HttpParams} from '@angular/common/http';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';

export function getProgressbarConfig(): ProgressbarConfig {
  return Object.assign(new ProgressbarConfig(), {animate: true, striped: true, max: 100});
}

import {environment} from '../../environments/environment';
import {AuthService} from '../services/auth.service';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [{provide: ProgressbarConfig, useFactory: getProgressbarConfig}]
})

export class ProfileComponent implements OnInit {
  curator_orcid = null;
  statByResource = [];
  generalStat = {
    generation_count: 0,
    revision_count: 0,
    invalidation_count: 0,
    badges_count: 0,
    medals_count: 0,
    resources_list: []
  };
  selectedResource = new BehaviorSubject<string>('');
  map_resources = {};
  mapMedals = {};
  mapBadgeNames = {};
  mapBadgeCategories = {};




  localAuth = new BehaviorSubject<object>({});
  logedIn = false;
  progress;
  formData = new FormData();
  profileData = new BehaviorSubject<object>({});
  editMode = new BehaviorSubject<boolean>(false);
  loading_finished = false;
  env;
  public today: Date = new Date();
  resourcesList = new Set();
  entriesList = [];
  proteinList = [];
  pmidList = [];
  orcidData = {};
  userDataByResources = {};

  map_all_badges = {};

  employment = [];

  listResourcesSmall = new BehaviorSubject<object[]>([]);
  selectedResourceData = new BehaviorSubject<object>({});
  imgURL: any;

  badgesAndMedals = [];

  @ViewChild('file', {static: true}) file;

  constructor(public authService: AuthService,
              private internalService: InternalService) {
  }

  ngOnInit() {
    this.env = environment;
    this.curator_orcid = window.location.pathname.substring(7, 26);
    this.authService.loginData.subscribe(authData => {
      if (this.localAuth.value !== authData) {
        this.localAuth.next(authData);
        this.logedIn = this.curator_orcid === authData['orcid_id'];

      }
    });

    this.internalService.getResources(new HttpParams()).subscribe(resources => {
      if (Array.isArray(resources)) {
        resources.forEach(currResource => {
          this.map_resources[currResource['resource_uri']] = currResource;
          this.mapBadgeCategories[currResource['resource_uri']] = [];
          currResource['badges'].forEach(currBadge => {
            if (!this.mapBadgeCategories[currResource['resource_uri']].hasOwnProperty(currBadge['category'])) {
              this.mapBadgeCategories[currResource['resource_uri']][currBadge['category']] = [];
            }
            this.mapBadgeCategories[currResource['resource_uri']][currBadge['category']].push(currBadge);
          });
          console.log( Object.keys(this.mapBadgeCategories[currResource['resource_uri']]));


          Object.keys(this.mapBadgeCategories[currResource['resource_uri']]).forEach(currCategory => {
            this.mapBadgeCategories[currResource['resource_uri']][currCategory] = this.mapBadgeCategories[currResource['resource_uri']][currCategory].sort((a, b) => a.count_threshold > b.count_threshold ? 1 : -1)
          });
        });
      }
    }, (err) => {
    }, () => {

      this.internalService.getLeaderboards(new HttpParams()
        .set('curator_orcid', this.curator_orcid).set('with_terms', 'true')).subscribe(leaderBoardData => {
        if (Array.isArray(leaderBoardData)) {
          this.statByResource = leaderBoardData;
          leaderBoardData.forEach(currStat => {
            this.generalStat.generation_count += currStat.generation_count;
            this.generalStat.revision_count += currStat.revision_count;
            this.generalStat.invalidation_count += currStat.invalidation_count;
            this.generalStat.badges_count += currStat.badges_count;
            this.generalStat.medals_count += currStat.medals_count;
          });
        }
      }, (err) => {
      }, () => {
        if (this.statByResource.length > 0) {
          this.selectedResource.next(this.statByResource.sort((a, b) => a.medals_count < b.medals_count ? 1 : -1)[0]['resource_uri']);
        }
      });
    });

      this.internalService.getAchievements(new HttpParams()
        .set('curator_orcid', this.curator_orcid).set('filter_priority', 'true')).subscribe(achievements => {
          // console.log('achievements', achievements);
        if (Array.isArray(achievements)) {
          achievements.forEach( currAchievements => {
            if (currAchievements.type === 'medal') {
              // console.log('achievements', achievements);

              if (!this.mapMedals.hasOwnProperty(currAchievements['resource_uri'])) {
                this.mapMedals[currAchievements['resource_uri']] = [];
              }
              this.mapMedals[currAchievements['resource_uri']].push(currAchievements);
            } else if (currAchievements.type === 'badge') {
              if (!this.mapBadgeNames.hasOwnProperty(currAchievements['resource_uri'])) {
                this.mapBadgeNames[currAchievements['resource_uri']] = [];
              }
              this.mapBadgeNames[currAchievements['resource_uri']].push(currAchievements.name);
            }
          });
          Object.keys(this.mapMedals).forEach(currDatabase => {
            this.mapMedals[currDatabase] = this.mapMedals[currDatabase].sort((a, b) => a.name > b.name ? 1 : -1);
          });

        }
      }, (err) => {}, () => {});



    this.internalService.GetORCIDprofile(this.curator_orcid).subscribe(currORCIDdata => {
      this.orcidData = currORCIDdata;
      if (currORCIDdata['activities-summary']?.['employments']?.hasOwnProperty('affiliation-group')) {
        this.employment = currORCIDdata['activities-summary']['employments']['affiliation-group'];
      }
    });

    window.addEventListener("scroll", event => {
      if (document.getElementById("second-nav-bar")) {
        if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
          document.getElementById("second-nav-bar").style['margin-top'] = '0px';
          document.getElementById("second-nav-bar").style['padding-top'] = '10px';
          // document.getElementById("logo_nav").style['margin'] = '0rem 0rem';

        } else {
          document.getElementById("second-nav-bar").style['margin-top'] = '75px';
          document.getElementById("second-nav-bar").style['padding-top'] = '0px';
          // document.getElementById("logo_nav").style['margin'] = '3rem 0rem';
        }
      }
    });


    // this.env = environment;
    // const orcid_id = window.location.pathname.substring(7, 26);
    // this.orcidID = orcid_id;
    // this.authService.loginData.subscribe(authData => {
    //   if (this.localAuth.value !== authData) {
    //     this.localAuth.next(authData);
    //   }
    // });
    //
    // this.localAuth.subscribe(authData => {
    //   // if (!authData.hasOwnProperty('initial')) {
    //   // console.log('authData', authData);
    //   console.log('orcid_id', orcid_id);
    //
    //   this.logedIn = orcid_id === authData['orcid_id'];
    //
    //   this.internalService.GetStatistics({
    //     curator_orcid: orcid_id
    //   }).subscribe((browseData) => {
    //     this.profileData.next(browseData[0]);
    //     this.internalService.GetStat().subscribe((statData) => {
    //       statData['resources'].forEach(currResource => {
    //         this.map_resources[currResource.resource_uri] = currResource;
    //       });
    //
    //     }, (err) => {
    //     }, () => {
    //       console.log('this.map_resources', this.map_resources);
    //
    //       this.internalService.getAchievements(new HttpParams()
    //         .set('curator_orcid', orcid_id)
    //         .set('filter_priority', 'true')).subscribe((badgesAndMedals) => {
    //         this.badgesAndMedals = badgesAndMedals;
    //
    //       }, (err) => {
    //       }, () => {
    //         console.log('this.badgesAndMedals', this.badgesAndMedals);
    //       });
    //
    //
    //
    //     });
    //
    //   }, (err) => {
    //   }, () => {
    //     this.internalService.GetORCIDprofile(orcid_id).subscribe(currORCIDdata => {
    //       this.orcidData = currORCIDdata;
    //       if (currORCIDdata.hasOwnProperty('activities-summary') && currORCIDdata['activities-summary'].hasOwnProperty('employments') && currORCIDdata['activities-summary']['employments'].hasOwnProperty('affiliation-group')) {
    //         this.employment = currORCIDdata['activities-summary']['employments']['affiliation-group'];
    //       }
    //       console.log('employment', this.employment);
    //
    //     });
    //
    //
    //     if (this.profileData.value.hasOwnProperty('statistics')) {
    //       this.profileData.value['statistics'].forEach(currReport => {
    //         if (currReport.resource_uri) {
    //           this.resourcesList.add(currReport.resource_uri.substr(42));
    //         }
    //       });
    //     }
    //
    //     // console.log(this.resourcesList);
    //     Array.from(this.resourcesList).forEach(currResourceURI => {
    //       this.userDataByResources[String(currResourceURI)] = {
    //         name: currResourceURI
    //       };
    //
    //
    //       if (this.profileData.value.hasOwnProperty('badges')) {
    //         // this.userDataByResources[String(currResourceURI)]['generation_reports_length']
    //         this.userDataByResources[String(currResourceURI)]['badge'] = this.profileData.value['badges'].filter(x => {
    //           return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
    //         }).map(x => x.name);
    //       } else {
    //         // this.userDataByResources[String(currResourceURI)]['generation_reports_length']
    //         this.userDataByResources[String(currResourceURI)]['badge'] = [];
    //       }
    //       if (this.profileData.value.hasOwnProperty('medals')) {
    //         // this.userDataByResources[String(currResourceURI)]['generation_reports_length']
    //         this.userDataByResources[String(currResourceURI)]['medal'] = this.profileData.value['medals'].filter(x => {
    //           return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
    //         }).sort((a, b) => a.name > b.name ? 1 : -1);
    //       } else {
    //         // this.userDataByResources[String(currResourceURI)]['generation_reports_length']
    //         this.userDataByResources[String(currResourceURI)]['medal'] = [];
    //       }
    //
    //       if (this.profileData.value.hasOwnProperty('generation_terms')) {
    //         this.userDataByResources[String(currResourceURI)]['generation_terms'] = this.profileData.value['generation_terms'].filter(x => {
    //           return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
    //         });
    //         this.userDataByResources[String(currResourceURI)]['generation_counts'] = this.profileData.value['generation_terms'].filter(x => {
    //           return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
    //         }).map(x => x.count).reduce((a, b) => a + b, 0);
    //       } else {
    //         this.userDataByResources[String(currResourceURI)]['generation_terms'] = [];
    //         this.userDataByResources[String(currResourceURI)]['generation_counts'] = 0;
    //       }
    //       if (this.profileData.value.hasOwnProperty('revision_terms')) {
    //         this.userDataByResources[String(currResourceURI)]['revision_terms'] = this.profileData.value['revision_terms'].filter(x => {
    //           return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
    //         });
    //         this.userDataByResources[String(currResourceURI)]['revision_counts'] = this.profileData.value['revision_terms'].filter(x => {
    //           return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
    //         }).map(x => x.count).reduce((a, b) => a + b, 0);
    //       } else {
    //         this.userDataByResources[String(currResourceURI)]['revision_terms'] = [];
    //         this.userDataByResources[String(currResourceURI)]['revision_counts'] = 0;
    //       }
    //       if (this.profileData.value.hasOwnProperty('invalidation_terms')) {
    //         this.userDataByResources[String(currResourceURI)]['invalidation_terms'] = this.profileData.value['invalidation_terms'].filter(x => {
    //           return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
    //         });
    //         this.userDataByResources[String(currResourceURI)]['invalidation_counts'] = this.profileData.value['invalidation_terms'].filter(x => {
    //           return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
    //         }).map(x => x.count).reduce((a, b) => a + b, 0);
    //       } else {
    //         this.userDataByResources[String(currResourceURI)]['invalidation_terms'] = [];
    //         this.userDataByResources[String(currResourceURI)]['invalidation_counts'] = 0;
    //       }
    //
    //
    //     });
    //
    //     this.internalService.GetResearces({}).subscribe(data => {
    //       data.forEach(currResource => {
    //         if (this.userDataByResources.hasOwnProperty(currResource['resource_id'])) {
    //           this.userDataByResources[currResource['resource_id']]['possible_badges'] = {};
    //           // = {'possible_badges': {}};
    //           if (this.userDataByResources.hasOwnProperty(currResource['resource_id'])) {
    //             currResource['badges'].forEach(currBadge => {
    //
    //               if (!this.userDataByResources[currResource['resource_id']]['possible_badges'].hasOwnProperty(currBadge['category'])) {
    //                 this.userDataByResources[currResource['resource_id']]['possible_badges'][currBadge['category']] = [];
    //               }
    //               this.userDataByResources[currResource['resource_id']]['possible_badges'][currBadge['category']].push(currBadge);
    //             });
    //             console.log(this.userDataByResources[currResource['resource_id']]['possible_badges']);
    //             this.userDataByResources[currResource['resource_id']]['badge_categories'] = Object.keys(this.userDataByResources[currResource['resource_id']]['possible_badges']);
    //             this.userDataByResources[currResource['resource_id']]['badge_categories'].forEach(currCategory => {
    //               this.userDataByResources[currResource['resource_id']]['possible_badges'][currCategory].sort((a, b) => a.count_threshold > b.count_threshold ? 1 : -1);
    //             });
    //           }
    //         }
    //       });
    //     }, (err) => {
    //     }, () => {
    //     });
    //
    //
    //     this.loading_finished = true;
    //     console.log('finish');
    //   });
    //
    //
    //   // }
    //
    // });


  }

  numberOfEntries(resource) {
    const entriesSet = new Set();
    this.profileData['contribution'].forEach(currObj => {
      if (currObj.resource === resource) {
        entriesSet.add(currObj.resource_entry_id);
      }
    });
    // console.log(entriesSet)
    return Array.from(entriesSet).length;
  }

  numberOfActions(resource) {
    return this.profileData.value['reports'].filter(currObj => {
      return currObj.resource_name === resource;
    }).length;
  }

  reportFilter(resource) {
    let returnArray = [];
    if (this.profileData.value.hasOwnProperty('generation_reports')) {
      returnArray = returnArray.concat(this.profileData.value['generation_reports'].filter(currObj => {
        return currObj.resource_uri === 'https://registry.identifiers.org/registry/' + resource;
      }));
    }
    if (this.profileData.value.hasOwnProperty('revision_reports')) {
      returnArray = returnArray.concat(this.profileData.value['revision_reports'].filter(currObj => {
        return currObj.resource_uri === 'https://registry.identifiers.org/registry/' + resource;
      }));

    }
    if (this.profileData.value.hasOwnProperty('invalidation_reports')) {
      returnArray = returnArray.concat(this.profileData.value['invalidation_reports'].filter(currObj => {
        return currObj.resource_uri === 'https://registry.identifiers.org/registry/' + resource;
      }));
    }
    return returnArray;
  }

  proteinsFilter() {
    const proteinsSet = new Set();
    this.profileData['contribution'].forEach(currObj => {
      proteinsSet.add(currObj.acc);
    });

    return Array.from(proteinsSet).map(currACC => {
      const resourcesSet = new Set();
      const term_number = this.profileData['contribution'].filter(currObj => {
        if (currObj.acc === currACC) {
          resourcesSet.add(currObj.resource);
          return true;
        }
        return false;
      }).length;
      const protein_data = this.profileData['contribution'].find(currObj => {
        return currObj.acc === currACC;
      });
      return {
        acc: protein_data.acc,
        name: protein_data.name,
        term_number: term_number,
        resources: Array.from(resourcesSet)
      };
    });
  }

  pubmedFilter() {
    const pmidSet = new Set();
    this.profileData['contribution'].forEach(currObj => {
      pmidSet.add(currObj.pmid);
    });

    return Array.from(pmidSet).map(currPMID => {
      const resourcesSet = new Set();
      const accSet = new Set();
      const term_number = this.profileData['contribution'].filter(currObj => {
        if (currObj.pmid === currPMID) {
          resourcesSet.add(currObj.resource);
          accSet.add(currObj.acc);
          return true;
        }
        return false;
      }).length;
      return {
        pmid: currPMID,
        title: '',
        term_number: term_number,
        resources: Array.from(resourcesSet),
        acc: Array.from(accSet)
      };
    });
  }

  isCurrentPosition(date, currPosition) {

    if (date) {

      if (date['year'] && date['month'] && date['day']) {
        if (Date.UTC(date['year']['value'], date['month']['value'] - 1, date['day']['value']) >= Date.now()) {


          return true;
        }
      } else if (date['year'] && date['month']) {
        if (Date.UTC(date['year']['value'], date['month']['value'] - 1) >= Date.now()) {
          console.log('date_at', Date.now(), date, currPosition);

          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }

  onFilesAdded() {
    console.log(this.file);
    const reader = new FileReader();
    this.formData.append('profile_picture', this.file.nativeElement.files[0], this.file.nativeElement.files[0].name);
    reader.readAsDataURL(this.file.nativeElement.files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };
  }

  addFiles() {

    console.log('file select window');
    console.log(this.file);

    this.file.nativeElement.click();
  }

  sendData() {
    console.log('file uploading');


    this.internalService.PostProfilePicture(this.formData, this.curator_orcid).subscribe((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.Sent:
          console.log('Request has been made!');
          break;
        case HttpEventType.ResponseHeader:
          console.log('Response header has been received!');
          break;
        case HttpEventType.UploadProgress:
          this.progress = Math.round(event.loaded / event.total * 100);
          console.log(`Uploaded! ${this.progress}%`);
          break;
        case HttpEventType.Response:
          console.log('User successfully created!', event.body);
          setTimeout(() => {
            this.progress = 0;
            this.ngOnInit();
          }, 500);


      }

    });
  }
}
