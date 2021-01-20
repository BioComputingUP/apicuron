import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {InternalService} from '../services/internal.service';

@Component({
  selector: 'app-details-table',
  templateUrl: './details-table.component.html',
  styleUrls: ['./details-table.component.scss']
})
export class DetailsTableComponent implements OnInit {
  // declaration, data loading
  // @Input() dataArray: [];
  @Input() database;
  @Input() profileData;
  tableDataSource_f = new BehaviorSubject<any[]>([]);
  tableDataSource = new BehaviorSubject<any[]>([]);
  totalItems = 0;

  displayedColumns = new BehaviorSubject<string[]>([
    'entry',
    'acc',
    'name',
    // 'term_number'
  ]);

  // declaration, pagination
  currentPage = new BehaviorSubject<object>({'page': 1});
  pageSize = new BehaviorSubject<number>(10);
  dataOnPage = new BehaviorSubject<any[]>([]);

  // declaration, search
  searchForm: FormGroup;
  sortKey = new BehaviorSubject<string>('entry');
  sortDirection = new BehaviorSubject<string>('asc');

statArray= [];

  constructor(private fb: FormBuilder,
              private internalService: InternalService) { }

  ngOnInit() {

    this.searchForm = this.fb.group({
      textSearch: null,
      firstDay:  new Date(1990, 0, 1),
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
        this.internalService.GetSearchDetails({
          curator_orcid: this.profileData.value['orcid'],
          resource_id: this.database,
          page_size: 10,
          page: currentPage['page'] - 1,
          first_day: searchTerm.firstDay,
          last_day: searchTerm.lastDay
        }).subscribe(currData => {
           this.dataOnPage.next(currData.reports);
           this.totalItems = currData.count_total_reports;
           this.statArray = currData.stat.sort((a, b) => a.activity_name > b.activity_name);
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
}
