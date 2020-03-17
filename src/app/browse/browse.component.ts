import {Component, OnInit} from '@angular/core';
import {concat, BehaviorSubject, combineLatest, of} from 'rxjs';
import {InternalService} from '../services/internal.service';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  loading_finished = false;
  dataOnPage = new BehaviorSubject<any[]>([]);
  displayedColumns = ['entry_id', 'name', 'events', 'by_category', 'by_term', 'badges'];
  sortKey = new BehaviorSubject<string>('entry_id');
  sortDirection = new BehaviorSubject<string>('asc');

  localAuth = new BehaviorSubject<object>({});


  constructor(public authService: AuthService,
              private internalService: InternalService) {
  }

  ngOnInit() {
    this.authService.loginData.subscribe(authData => {
      if (this.localAuth.value !== authData) {
        this.localAuth.next(authData);
      }
    });

    this.localAuth.subscribe(authData => {
      console.log('authData', authData);

      if (!authData.hasOwnProperty('initial')) {
        this.internalService.GetSearch({
          page_size: 100
        }).subscribe((browseData) => {
          this.dataOnPage.next(browseData);
        }, (err) => {
        }, () => {
          this.loading_finished = true;
          console.log('finish');
        });
        // this.internalService.GetSearch({
        //   page_size: 100
        // }).subscribe((browseData) => {
        //     // console.log(browseData.data);
        //     this.dataOnPage.next(browseData.data);
        //   }, (err) => {
        //   },
        //   () => {
        //     this.loading_finished = true;
        //     console.log('finish');
        //   });
      }
    });

  }

  adjustSort(key: string) {
    if (this.sortKey.value === key) {
      if (this.sortDirection.value === 'asc') {
        this.sortDirection.next('desc');
      } else {
        this.sortDirection.next('asc');
      }
      return;
    }

    this.sortKey.next(key);
    this.sortDirection.next('asc');
  }

  calc_by_terms(row) {
    const map_terms = {};
    const set_terms_name = new Set();
    row.forEach(curr_activity => {
      set_terms_name.add(curr_activity.activity_term);
      if (!map_terms.hasOwnProperty(curr_activity.activity_term)) {
        map_terms[curr_activity.activity_term] = new Set();
      }
      map_terms[curr_activity.activity_term].add(curr_activity.entity_uri);
    });
    // console.log('map_terms', map_terms);
    // console.log('set_terms_name', set_terms_name);
    const out_put = [];
    Array.from(set_terms_name).sort().forEach(currTerm => {
      if (map_terms.hasOwnProperty(currTerm)) {
        // console.log('map_terms[currTerm]', map_terms[currTerm]);
        // console.log('map_terms[currTerm].length', map_terms[currTerm].length);
        // console.log('map_terms[currTerm].length.toString()', map_terms[currTerm].length.toString());
        // out_put.push('<strong>' + currTerm + ':</strong> ');
        out_put.push('<strong>' + currTerm + ':</strong> ' + map_terms[currTerm].size.toString());
      }
    });
    return '<small>' + out_put.join('<br>') + '</small>';
  }

  calc_html_badges(row) {
    const out_put = [];

    if (Array.isArray(row)) {
      row.forEach(currTerm => {
        out_put.push('<span class="badge  badge-pill badge-warning pl-1 text-center">' + currTerm + '</span>');
      });
    }

    return '<small>' + out_put.join('<br>') + '</small>';
  }
  calc_html_categories(row) {
    const out_put = [];
    if (Array.isArray(row)) {
      row.forEach(currTerm => {
        out_put.push('<strong>' + currTerm['activity_category'] + ': </strong>' + currTerm['count_activity_category'].toString());
      });
    }

    return '<small>' + out_put.join('<br>') + '</small>';
  }
}
