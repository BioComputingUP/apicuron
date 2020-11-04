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
    const listResourceURI = new Set();
    if (this.userData.hasOwnProperty('generation_reports')) {
      this.userData['generation_reports'].forEach(x => {
        listResourceURI.add(x.resource_uri);
      });
    }

    if (this.userData.hasOwnProperty('revision_reports')) {
      this.userData['revision_reports'].forEach(x => {
        listResourceURI.add(x.resource_uri);
      });
    }


    if (this.userData.hasOwnProperty('invalidation_reports')) {
      this.userData['invalidation_reports'].forEach(x => {
        listResourceURI.add(x.resource_uri);
      });
    }


    Array.from(listResourceURI).forEach(currResourceURI => {
      const output = {
        name: this.map_resources[String(currResourceURI)].resource_name,
      };

      if (this.userData.hasOwnProperty('generation_reports')) {
        output['generation_reports'] = this.userData['generation_reports'].filter(x => x.resource_uri === currResourceURI);
      }
      if (this.userData.hasOwnProperty('revision_reports')) {
        output['revision_reports'] = this.userData['revision_reports'].filter(x => x.resource_uri === currResourceURI);
      }
      if (this.userData.hasOwnProperty('invalidation_reports')) {
        output['invalidation_reports'] = this.userData['invalidation_reports'].filter(x => x.resource_uri === currResourceURI);
      }
      this.userDataByResources.push(output);
    });
  }

  calc_by_terms(row) {
    const map_terms = {};
    const set_terms_name = new Set();
    if (row) {
      row.forEach(curr_activity => {
        set_terms_name.add(curr_activity.activity_name);
        if (!map_terms.hasOwnProperty(curr_activity.activity_name)) {
          map_terms[curr_activity.activity_name] = new Set();
        }
        map_terms[curr_activity.activity_name].add(curr_activity.entity_uri);
      });
      const out_put = [];
      Array.from(set_terms_name).sort().forEach((currTerm: string) => {
        if (map_terms.hasOwnProperty(currTerm)) {
          // console.log('map_terms[currTerm]', map_terms[currTerm]);
          // console.log('map_terms[currTerm].length', map_terms[currTerm].length);
          // console.log('map_terms[currTerm].length.toString()', map_terms[currTerm].length.toString());
          // out_put.push('<strong>' + currTerm + ':</strong> ');
          out_put.push('<strong>' + currTerm + ':</strong> ' + map_terms[currTerm].size.toString());
        }
      });
      return '<small>' + out_put.join('<br>') + '</small>';
    } else {
      return '';
    }

  }

}
