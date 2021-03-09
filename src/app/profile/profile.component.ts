import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {InternalService} from '../services/internal.service';
import {concat, BehaviorSubject, Observable, combineLatest} from 'rxjs';
import {ProgressbarConfig} from 'ngx-bootstrap';
import {HttpEvent, HttpClient, HttpRequest, HttpEventType, HttpParams} from '@angular/common/http';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {ActivatedRoute} from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

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
  exists_in_apicuron = false;
  modalRef: BsModalRef;

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
  profilePictureID = null;


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
              private modalService: BsModalService,
              private scrollToService: ScrollToService,
              private route: ActivatedRoute,
              private internalService: InternalService) {
  }

  ngOnInit() {
    this.generalStat.generation_count = 0;
    this.generalStat.revision_count = 0;
    this.generalStat.invalidation_count = 0;
    this.generalStat.badges_count = 0;
    this.generalStat.medals_count = 0;
    this.mapMedals = {};


    this.env = environment;
    this.curator_orcid = window.location.pathname.substring(7, 26);
    this.authService.loginData.subscribe(authData => {
      if (this.localAuth.value !== authData) {
        this.localAuth.next(authData);
        this.logedIn = this.curator_orcid === authData['orcid_id'];

      }
    });
    this.internalService.getProfilePictureID(this.curator_orcid).subscribe(result => {
      if (result && result.hasOwnProperty('profile_picture')) {
        this.profilePictureID = result.profile_picture;
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
          console.log(Object.keys(this.mapBadgeCategories[currResource['resource_uri']]));


          Object.keys(this.mapBadgeCategories[currResource['resource_uri']]).forEach(currCategory => {
            this.mapBadgeCategories[currResource['resource_uri']][currCategory] = this.mapBadgeCategories[currResource['resource_uri']][currCategory].sort((a, b) => a.count_threshold > b.count_threshold ? 1 : -1);
          });
        });
      }
    }, (err) => {
    }, () => {

      this.internalService.getLeaderboards(new HttpParams()
        .set('curator_orcid', this.curator_orcid).set('with_terms', 'true')).subscribe(leaderBoardData => {
        if (Array.isArray(leaderBoardData) && leaderBoardData.length > 0 ) {
          this.exists_in_apicuron = true;
          this.statByResource = leaderBoardData;
          leaderBoardData.forEach(currStat => {
            this.generalStat.generation_count += currStat.generation_count;
            this.generalStat.revision_count += currStat.revision_count;
            this.generalStat.invalidation_count += currStat.invalidation_count;
            this.generalStat.badges_count += currStat.badges_count;
            this.generalStat.medals_count += currStat.medals_count;
          });
        } else {
          console.log('This ORCID is not registered at APICURON!');
        }
      }, (err) => {
      }, () => {
        this.loading_finished = true;

        if (this.statByResource.length > 0) {
          if (this.route.snapshot.fragment && this.statByResource.map(x => this.map_resources[x['resource_uri']]['resource_id']).includes(this.route.snapshot.fragment.toLowerCase())) {
            const config: ScrollToConfigOptions = {
              target: 'selected',
              offset: -150,
              duration: 0.2,
              // target: this.route.snapshot.fragment
            };
            this.selectedResource.next('https://registry.identifiers.org/registry/' + this.route.snapshot.fragment.toLowerCase());
            this.scrolTo(this.scrollToService, config);
          } else {
            // this.selectedResource.next(this.statByResource.sort((a, b) => a.medals_count < b.medals_count ? 1 : -1)[0]['resource_uri']);
          }
        }
      });
    });

    this.internalService.getAchievements(new HttpParams()
      .set('curator_orcid', this.curator_orcid).set('filter_priority', 'true')).subscribe(achievements => {
      // console.log('achievements', achievements);
      if (Array.isArray(achievements)) {
        achievements.forEach(currAchievements => {
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
    }, (err) => {
    }, () => {
    });


    this.internalService.GetORCIDprofile(this.curator_orcid).subscribe(currORCIDdata => {
      this.orcidData = currORCIDdata;
      if (currORCIDdata['activities-summary']?.['employments']?.hasOwnProperty('affiliation-group')) {
        this.employment = currORCIDdata['activities-summary']['employments']['affiliation-group'];
      }
    });

    window.addEventListener('scroll', event => {
      if (document.getElementById('second-nav-bar')) {
        if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
          document.getElementById('second-nav-bar').style['margin-top'] = '0px';
          document.getElementById('second-nav-bar').style['padding-top'] = '10px';
          // document.getElementById("logo_nav").style['margin'] = '0rem 0rem';

        } else {
          document.getElementById('second-nav-bar').style['margin-top'] = '75px';
          document.getElementById('second-nav-bar').style['padding-top'] = '0px';
          // document.getElementById("logo_nav").style['margin'] = '3rem 0rem';
        }
      }
    });
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

  scrolTo(newState, config) {
    setTimeout(function () {
      newState.scrollTo(config);
    }, 800);
  }

  hideProfile() {
    this.internalService.getHideProfile(this.curator_orcid).subscribe((res) => {
      this.authService.authentication();
      this.ngOnInit();
    });
  }

  showProfile() {
    this.internalService.getShowProfile(this.curator_orcid).subscribe((res) => {
      this.authService.authentication();
      this.ngOnInit();
    });
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'gray modal-lg' })
    );

  }

}
