import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-browse-ribbon',
  templateUrl: './browse-ribbon.component.html',
  styleUrls: ['./browse-ribbon.component.scss']
})
export class BrowseRibbonComponent implements OnInit {
  @Input() userData;
  constructor() { }

  ngOnInit(): void {
  }
  calc_by_terms(row) {
    const map_terms = {};
    const set_terms_name = new Set();
    if (row) {
      row.forEach(curr_activity => {
        set_terms_name.add(curr_activity.activity_term);
        if (!map_terms.hasOwnProperty(curr_activity.activity_term)) {
          map_terms[curr_activity.activity_term] = new Set();
        }
        map_terms[curr_activity.activity_term].add(curr_activity.entity_uri);
      });
      const out_put = [];
      Array.from(set_terms_name).sort().forEach( (currTerm: string) => {
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
