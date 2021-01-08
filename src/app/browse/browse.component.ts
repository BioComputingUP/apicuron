import {Component, OnInit} from '@angular/core';
import {concat, BehaviorSubject, combineLatest, of} from 'rxjs';
import {InternalService} from '../services/internal.service';
import {AuthService} from '../services/auth.service';
import {FormControl, FormGroup, FormBuilder, FormArray} from '@angular/forms';
// import {MatTableModule} from '@angular/material/table';
import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', maxHeight: '0',  visibility: 'hidden'})),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('1000ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BrowseComponent implements OnInit {
  columnsFormNew;
  collapseColumns = true;
  searchForm: FormArray;
  loading_finished = false;
  loading_new_table = true;

  radioModel = '20';
  isExpansionDetailRow = true;
  expandedElement: any;
  selectedRow = "";
  localAuth = new BehaviorSubject<object>({});
  displayedColumns = new BehaviorSubject<object>(['name', 'orcid', 'generation_count', 'revision_count', 'invalidation_count', 'medals', 'badges', 'resources']);
  currentPage = new BehaviorSubject<object>({
    'page': 1
  });
  pageSize = new BehaviorSubject<number>(20);
  dataOnPage = new BehaviorSubject<any[]>([]);
  totalItems: number;
  sortKey = new BehaviorSubject<string>('orcid');
  sortDirection = new BehaviorSubject<string>('asc');
  map_resources = {};


  constructor(public authService: AuthService,
              private fb: FormBuilder,
              private internalService: InternalService) {
  }

  ngOnInit() {
    this.searchForm = this.fb.array([]);
    this.authService.loginData.subscribe(authData => {
      if (this.localAuth.value !== authData) {
        this.localAuth.next(authData);
      }
    });

    this.columnsFormNew = this.fb.group({
      orcid: this.fb.control(true),
      name: this.fb.control(true),
      generation_reports: this.fb.control(false),
      generation_count: this.fb.control(true),
      revision_reports: this.fb.control(false),
      revision_count: this.fb.control(true),
      invalidation_reports: this.fb.control(false),
      invalidation_count: this.fb.control(true),
      badge: this.fb.control(true),

    });
    this.columnsFormNew.valueChanges.subscribe(columsObj => {
      // console.log(columsObj);
      const newDisplayedColumns = [];
      Object.keys(columsObj).forEach(currColumn => {
        if (columsObj[currColumn]) {
          newDisplayedColumns.push(currColumn);
        }
      });
      this.displayedColumns.next(newDisplayedColumns);
    });


    this.localAuth.subscribe(authData => {
      console.log('authData', authData);
      // if (!authData.hasOwnProperty('initial')) {
      this.loading_new_table = true;
      this.dataOnPage.next([]);
      this.totalItems = 0;


      combineLatest(this.searchForm.valueChanges,
        this.pageSize,
        this.sortKey,
        this.sortDirection,
        this.currentPage,
      ).subscribe(([formData,
                     pageSize,
                     sortKey,
                     sortDirection,
                     currentPage]) => {
        const search_params = {};
        search_params['sort_field'] = sortKey;
        search_params['sort_value'] = sortDirection;
        search_params['page_size'] = pageSize;
        search_params['page'] = currentPage['page'] - 1;
        // console.log('formData', formData);
        formData.forEach(currItem => {
          if (['time_from', 'time_last'].includes(currItem.area)) {
            try {
              search_params[currItem.area] = currItem.key.toISOString().slice(0, 10);
            } catch (e) {

            }
          } else if (currItem.key) {
            search_params[currItem.area] = currItem.key;
          }
        });
        this.loading_finished = false;
        this.loading_new_table = true;

        this.internalService.GetSearch2(search_params).subscribe((browseData) => {
          this.dataOnPage.next(browseData.biocurators);
          this.totalItems = browseData.count_biocurators;
          browseData.list_resources.forEach(currResource => {
            this.map_resources[currResource.resource_uri] = currResource;
          });
        }, (err) => {
        }, () => {



          this.loading_new_table = false;
          this.loading_finished = true;
          console.log('finish');
        });
      });
      const rows = this.searchForm as FormArray;
      if (rows.length === 0) {
        rows.push(this.fb.group({
          // area: 'time_from',
          // key: new Date(2019, 9, 1)
          area: 'free_etxt',
          key: null
        }));
      }
      // }
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

  calc_html_resources(row) {
    const set_resources = new Set();
    const out_put = [];
    row.generation_terms.forEach(curr_term => {
      set_resources.add(curr_term['resource_uri']);
    });
    row.revision_terms.forEach(curr_term => {
      set_resources.add(curr_term['resource_uri']);
    });
    row.invalidation_terms.forEach(curr_term => {
      set_resources.add(curr_term['resource_uri']);
    });
    Array.from(set_resources).forEach(currTerm => {
        out_put.push('<span class="badge  badge-pill badge-apicuron pl-1 text-center small">' + this.map_resources[currTerm.toString()]['resource_name'] + '</span>');
      });


    return '' + out_put.join('<br>') + '';
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

  checkFreeText(formObj, form_index) {
    // console.log('itt', formObj);
    for (let i = 0; i < formObj.length && i < form_index; i++) {
      // console.log(formObj[i])
      if (formObj[i].area === 'free_text') {
        // console.log('checkFreeText false');
        return false;
      }
    }
    // console.log('checkFreeText true');
    return true;
  }

  addSearchField(urlSearch, area) {
    const rows = this.searchForm as FormArray;
    rows.push(this.fb.group({
      area: area,
      key: null
    }));
  }

  removeSearchField(index) {
    const rows = this.searchForm as FormArray;
    rows.removeAt(index);
    if (rows.length === 0) {
      this.addSearchField(null, 'free_text');
    }

  }

  changeValuePageSize(itemsPerPage: string) {
    this.pageSize.next(Number(itemsPerPage));
  }
}
