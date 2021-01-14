import {Component, OnInit} from '@angular/core';
import {InternalService} from '../services/internal.service';
import {concat, BehaviorSubject, Observable, combineLatest} from 'rxjs';
import {ProgressbarConfig} from 'ngx-bootstrap';

export function getProgressbarConfig(): ProgressbarConfig {
  return Object.assign(new ProgressbarConfig(), {animate: true, striped: true, max: 100});
}

import {environment} from '../../environments/environment';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [{provide: ProgressbarConfig, useFactory: getProgressbarConfig}]
})

export class ProfileComponent implements OnInit {
  localAuth = new BehaviorSubject<object>({});
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
  map_resources = {};
  userDataByResources = {};


  map_all_badges = {};

  employment = [];

  selectedResource = new BehaviorSubject<string>('');
  listResourcesSmall = new BehaviorSubject<object[]>([]);
  selectedResourceData = new BehaviorSubject<object>({});


  constructor(public authService: AuthService,
              private internalService: InternalService) {
  }

  ngOnInit() {
    this.env = environment;
    const orcid_id = window.location.pathname.substring(7, 26);

    this.authService.loginData.subscribe(authData => {
      if (this.localAuth.value !== authData) {
        this.localAuth.next(authData);
      }
    });

    this.localAuth.subscribe(authData => {
      // if (!authData.hasOwnProperty('initial')) {
      // console.log('authData', authData);
      console.log('orcid_id', orcid_id);
      this.internalService.GetSearch2({
        curator_orcid: orcid_id
      }).subscribe((browseData) => {
        this.profileData.next(browseData.biocurators[0]);
        browseData.list_resources.forEach(currResource => {
          this.map_resources[currResource.resource_uri.substr(42)] = currResource;
        });

      }, (err) => {
      }, () => {

          this.internalService.GetORCIDprofile(orcid_id).subscribe(currORCIDdata => {


            this.orcidData = currORCIDdata;
            if (currORCIDdata.hasOwnProperty('activities-summary') && currORCIDdata['activities-summary'].hasOwnProperty('employments') && currORCIDdata['activities-summary']['employments'].hasOwnProperty('affiliation-group') ) {
              this.employment = currORCIDdata['activities-summary']['employments']['affiliation-group'];
            }
            console.log('employment', this.employment);

          });

        // console.log(this.profileData.value.hasOwnProperty('generation_terms'));
        if (this.profileData.value.hasOwnProperty('generation_terms')) {
          this.profileData.value['generation_terms'].forEach(currReport => {
            if (currReport.resource_uri) {
              this.resourcesList.add(currReport.resource_uri.substr(42));
            }
          });

        }
        if (this.profileData.value.hasOwnProperty('revision_terms')) {
          this.profileData.value['revision_terms'].forEach(currReport => {
            if (currReport.resource_uri) {
              this.resourcesList.add(currReport.resource_uri.substr(42));
            }
          });
        }
        if (this.profileData.value.hasOwnProperty('invalidation_terms')) {
          this.profileData.value['invalidation_terms'].forEach(currReport => {
            if (currReport.resource_uri) {
              this.resourcesList.add(currReport.resource_uri.substr(42));
            }
          });
        }
        // console.log(this.resourcesList);
        Array.from(this.resourcesList).forEach(currResourceURI => {




          this.userDataByResources[String(currResourceURI)] = {
            name: currResourceURI
          };
          if (this.profileData.value.hasOwnProperty('badges')) {
            // this.userDataByResources[String(currResourceURI)]['generation_reports_length']
            this.userDataByResources[String(currResourceURI)]['badge'] = this.profileData.value['badges'].filter(x => {
              return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
            }).map(x => x.name);
          } else {
            // this.userDataByResources[String(currResourceURI)]['generation_reports_length']
            this.userDataByResources[String(currResourceURI)]['badge'] = [];
          }
          if (this.profileData.value.hasOwnProperty('medals')) {
            // this.userDataByResources[String(currResourceURI)]['generation_reports_length']
            this.userDataByResources[String(currResourceURI)]['medal'] = this.profileData.value['medals'].filter(x => {
              return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
            });
          } else {
            // this.userDataByResources[String(currResourceURI)]['generation_reports_length']
            this.userDataByResources[String(currResourceURI)]['medal'] = [];
          }

          if (this.profileData.value.hasOwnProperty('generation_terms')) {
            this.userDataByResources[String(currResourceURI)]['generation_counts'] =  this.profileData.value['generation_terms'].filter(x => {
              return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
            }).map(x => x.count).reduce((a, b) => a + b, 0);
          } else {
            this.userDataByResources[String(currResourceURI)]['generation_counts'] = 0;
          }
          if (this.profileData.value.hasOwnProperty('revision_terms')) {
            this.userDataByResources[String(currResourceURI)]['revision_counts'] =  this.profileData.value['revision_terms'].filter(x => {
              return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
            }).map(x => x.count).reduce((a, b) => a + b, 0);
          } else {
            this.userDataByResources[String(currResourceURI)]['revision_counts'] = 0;
          }
          if (this.profileData.value.hasOwnProperty('invalidation_reports')) {
            this.userDataByResources[String(currResourceURI)]['invalidation_counts'] =  this.profileData.value['invalidation_terms'].filter(x => {
              return x.resource_uri === this.map_resources[String(currResourceURI)].resource_uri;
            }).map(x => x.count).reduce((a, b) => a + b, 0);
          } else {
            this.userDataByResources[String(currResourceURI)]['invalidation_counts'] = 0;
          }

          this.internalService.GetLeaderboard(String(currResourceURI), {curator_orcid: orcid_id }).subscribe(data => {
            console.log(data[0]['curators'][0]['ranking'])
            this.userDataByResources[String(currResourceURI)]['ranking'] = data[0]['curators'][0]['ranking'];
          }, (err) => {
          }, () => {
            // this.loading_finished = true;

          });





        });
        this.internalService.GetResearces({}).subscribe(data => {
          data.forEach(currResource => {

            if (this.userDataByResources.hasOwnProperty(currResource['resource_id'])) {

              this.userDataByResources[currResource['resource_id']]['possible_badges'] = currResource['badges'];

            }
          });
        }, (err) => {
        }, () => {
        });




        this.loading_finished = true;
        console.log('finish');
      });


      // }

    });


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
        if ( Date.UTC(date['year']['value'], date['month']['value'] - 1, date['day']['value']) >=  Date.now()) {


          return true;
        }
      } else if (date['year'] && date['month']) {
        if ( Date.UTC(date['year']['value'], date['month']['value'] - 1) >=  Date.now()) {
          console.log('date_at', Date.now(), date, currPosition);

          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }


}
