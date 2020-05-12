import { Component, OnInit } from '@angular/core';
import {InternalService} from '../services/internal.service';
import {concat, BehaviorSubject, Observable, combineLatest} from 'rxjs';
import {ProgressbarConfig} from 'ngx-bootstrap';
export function getProgressbarConfig(): ProgressbarConfig {
  return Object.assign(new ProgressbarConfig(), { animate: true, striped: true,  max: 100 });
}
import { environment } from '../../environments/environment';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [{ provide: ProgressbarConfig, useFactory: getProgressbarConfig }]
})

export class ProfileComponent implements OnInit {
  localAuth = new BehaviorSubject<object>({});
  profileData = new BehaviorSubject<object>({});
  editMode = new BehaviorSubject<boolean>(false);
  loading_finished = false;
  env;

  resourcesList = new Set();
  entriesList = [];
  proteinList = [];
  pmidList = [];

  constructor(public authService: AuthService,
              private internalService: InternalService) { }

  ngOnInit() {
    this.env = environment;
    const orcid_id = window.location.pathname.substring(7, 26);

    this.authService.loginData.subscribe(authData => {
      if (this.localAuth.value !== authData) {
        this.localAuth.next(authData);
      }
    });

    this.localAuth.subscribe(authData => {
      if (!authData.hasOwnProperty('initial')) {
        console.log('authData', authData);
        console.log(orcid_id);
        this.internalService.GetSearch({
          orcid: orcid_id
        }).subscribe((browseData) => {
          if (browseData.length === 1) {
            this.profileData.next(browseData[0]);
            this.profileData.value['reports'].forEach( currReport => {
              if (currReport.resource_name) {
                this.resourcesList.add(currReport.resource_name);
              }
            });
          }
        }, (err) => {
        }, () => {
          this.loading_finished = true;
          console.log('finish');
        });
      }



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
    return this.profileData.value['reports'].filter(currObj => {
      return currObj.resource_name === resource;
    });
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




}
