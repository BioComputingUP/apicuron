import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {InternalService} from '../services/internal.service';
import {HttpEvent, HttpClient, HttpRequest, HttpEventType, HttpParams} from '@angular/common/http';

@Component({
  selector: 'app-details-table',
  templateUrl: './details-table.component.html',
  styleUrls: ['./details-table.component.scss']
})
export class DetailsTableComponent implements OnInit {
  // declaration, data loading
  // @Input() dataArray: [];
  @Input() database;
  @Input() curator_orcid;
  @Input() currStatData;
  tableDataSource_f = new BehaviorSubject<any[]>([]);
  tableDataSource = new BehaviorSubject<any[]>([]);
  totalItems = 0;

  displayedColumns = new BehaviorSubject<string[]>([
    'entity_uri',
    'activity_name',
    'description',
    'timestamp',
    // 'term_number'
  ]);

  // declaration, pagination
  currentPage = new BehaviorSubject<object>({'page': 1});
  pageSize = new BehaviorSubject<number>(10);
  dataOnPage = new BehaviorSubject<any[]>([]);

  // declaration, search
  searchForm: FormGroup;
  sortKey = new BehaviorSubject<string>('entity_uri');
  sortDirection = new BehaviorSubject<string>('asc');

  statArray = [];
  mapStat = {};

  constructor(private fb: FormBuilder,
              private internalService: InternalService) { }

  ngOnInit() {

    this.currStatData.generation_terms.forEach(currTerm => this.statArray.push(currTerm));
    this.currStatData.revision_terms.forEach(currTerm => this.statArray.push(currTerm));
    this.currStatData.invalidation_terms.forEach(currTerm => this.statArray.push(currTerm));

    console.log( this.database);

    this.searchForm = this.fb.group({
      textSearch: null,
      firstDay:  new Date(1960, 0, 1),
      lastDay:  new Date()
    });


    // this.tableDataSource_f.next(this.dataArray);
    combineLatest(
      this.searchForm.valueChanges,
      this.sortKey,
      this.sortDirection,
      this.currentPage,
      this.pageSize)
      .subscribe(([
                    searchTerm,
                    sortKey,
                    sortDirection,
                    currentPage,
                    pageSize
                  ]) => {
        this.internalService.getReportsWithCount(new HttpParams()
          .set('sort_field', sortKey)
          .set('sort_value', sortDirection)
          .set('filter', searchTerm.textSearch)
          .set('curator_orcid', this.curator_orcid)
          .set('resource_uri', this.database)
          .set('page_size', '10')
          .set('page',  (currentPage['page'] - 1).toString())
          .set('first_day', searchTerm.firstDay)
          .set('last_day', searchTerm.lastDay)
        ).subscribe(currData => {
          this.dataOnPage.next(currData.body);
          this.totalItems = parseInt(currData.headers.get('count'));
        });
        this.mapStat = {};

        this.internalService.getReportsStats(new HttpParams()
          .set('filter', searchTerm.textSearch)
          .set('curator_orcid', this.curator_orcid)
          .set('resource_uri', this.database)
          .set('page_size', '10')
          .set('page',  (currentPage['page'] - 1).toString())
          .set('first_day', searchTerm.firstDay)
          .set('last_day', searchTerm.lastDay)
        ).subscribe(currData => {
          currData.forEach(currTerm => {
            this.mapStat[currTerm.activity_term] = currTerm;
          });
        });
      });
    this.searchForm.get('textSearch').setValue('');
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

  resetTime() {
    this.searchForm.get('firstDay').setValue(new Date(1990, 0, 1));
    this.searchForm.get('lastDay').setValue(new Date());
    this.searchForm.get('textSearch').setValue('');
  }
}
