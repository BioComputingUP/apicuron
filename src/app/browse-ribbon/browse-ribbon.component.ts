import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-browse-ribbon',
  templateUrl: './browse-ribbon.component.html',
  styleUrls: ['./browse-ribbon.component.scss']
})
export class BrowseRibbonComponent implements OnInit {
  @Input() userData;
  @Input() map_resources;
  userDataByResources = [];

  constructor() {
  }

  ngOnInit(): void {
    // console.log(this.userData);

    const listResourceURI = new Set();
    if (this.userData.hasOwnProperty('generation_terms')) {
      this.userData['generation_terms'].forEach(x => {
        listResourceURI.add(x.resource_uri);
      });
    }

    if (this.userData.hasOwnProperty('revision_terms')) {
      this.userData['revision_terms'].forEach(x => {
        listResourceURI.add(x.resource_uri);
      });
    }


    if (this.userData.hasOwnProperty('invalidation_terms')) {
      this.userData['invalidation_terms'].forEach(x => {
        listResourceURI.add(x.resource_uri);
      });
    }


    Array.from(listResourceURI).forEach(currResourceURI => {
      const output = {
        name: this.map_resources[String(currResourceURI)].resource_name,
      };



      if (this.userData.hasOwnProperty('badges')) {
        output['badges'] = this.userData['badges'].filter(x => x.resource_uri === currResourceURI);
      }
      if (this.userData.hasOwnProperty('generation_terms')) {
        output['generation_terms'] = this.userData['generation_terms'].filter(x => x.resource_uri === currResourceURI);
      }
      if (this.userData.hasOwnProperty('revision_terms')) {
        output['revision_terms'] = this.userData['revision_terms'].filter(x => x.resource_uri === currResourceURI);
      }
      if (this.userData.hasOwnProperty('invalidation_terms')) {
        output['invalidation_terms'] = this.userData['invalidation_terms'].filter(x => x.resource_uri === currResourceURI);
      }
      this.userDataByResources.push(output);
    });
  }

  calc_by_terms(row) {
    // console.log(row);

    if (row) {
      // console.log(row);
      const out_put = [];
      row.forEach(currTerm => {
        out_put.push('<strong>' + currTerm['activity_name'] + ':</strong> ' + currTerm['count']);
      });

      return '<small>' + out_put.join('<br>') + '</small>';
    } else {
      return '';
    }

  }

}
