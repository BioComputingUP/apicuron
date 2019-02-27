import { Component, OnInit } from '@angular/core';
import {InternalService} from '../services/internal.service';
import {concat, BehaviorSubject, Observable, combineLatest} from 'rxjs';
import {ProgressbarConfig} from 'ngx-bootstrap';
export function getProgressbarConfig(): ProgressbarConfig {
  return Object.assign(new ProgressbarConfig(), { animate: true, striped: true,  max: 100 });
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [{ provide: ProgressbarConfig, useFactory: getProgressbarConfig }]
})



export class ProfileComponent implements OnInit {

  profileData: object;
  loading_finished:boolean;
  editMode: boolean;

  resourcesList = [];
  entriesList = [];
  proteinList = [];
  pmidList = [];


  constructor(private internalService: InternalService) { }

  ngOnInit() {
    console.log(window.location.pathname.substring(1, 8))
    let orcidID = ''
    if (window.location.pathname.substring(1, 8) === 'profile') {
      this.editMode = false;
      orcidID = window.location.pathname.substring(9);
    } else if (window.location.pathname.substring(1, 12) === 'editprofile') {
      this.editMode = true;
      orcidID = window.location.pathname.substring(13);
    }
    // console.log(disprotId);

    const observables = [];
    observables.push(this.internalService.GetProfile(orcidID));
    concat(...observables).subscribe(
      profileData => {
        this.profileData = profileData;
      },
      err => console.log(err),
      () => {

        const resourcesSet = new Set();
        const entriesSet = new Set();
        const pmidSet = new Set();
        const proteinSet = new Set();

        this.profileData['contribution'].forEach(currObj => {
          entriesSet.add(currObj.resource_entry_id);
          resourcesSet.add(currObj.resource);
          pmidSet.add(currObj.pmid);
          proteinSet.add(currObj.acc);
        });
        // console.log(entriesSet)
         this.entriesList =  Array.from(entriesSet);
         this.resourcesList =  Array.from(resourcesSet);
         this.pmidList = Array.from(pmidSet);
         this.proteinList = Array.from(proteinSet);
        // this.entriesNumber = this.profileData['contribution'].filter()
          this.loading_finished= true
      }
    );

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
