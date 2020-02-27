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
  editMode = new BehaviorSubject<boolean>(false);
  loading_finished = false;
  env;
  profileData: object;

  resourcesList = [];
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
          orcid_id: orcid_id
        }).subscribe((browseData) => {
          // this.dataOnPage.next(browseData);
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

  numberOfTerms(resource) {
    return this.profileData['contribution'].filter(currObj => {
      return currObj.resource === resource;
    }).length;
  }

  termsFilter(resource) {
    const entriesSet = new Set();
    this.profileData['contribution'].forEach(currObj => {
      if (currObj.resource === resource) {
        entriesSet.add(currObj.resource_entry_id);
      }
    });
    return Array.from(entriesSet).map(currEntry => {
      const term_number = this.profileData['contribution'].filter(currObj => {
        return currObj.resource === resource && currObj.resource_entry_id === currEntry;
      }).length;
      const entry_data = this.profileData['contribution'].find(currObj => {
        return currObj.resource === resource && currObj.resource_entry_id === currEntry;
      });
      return {
        entry: currEntry,
        acc: entry_data.acc,
        name: entry_data.name,
        term_number: term_number
      };
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
