import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {UntypedFormControl} from '@angular/forms';

@Component({
  selector: 'app-proteins-detail-table',
  templateUrl: './proteins-detail-table.component.html',
  styleUrls: ['./proteins-detail-table.component.scss']
})
export class ProteinsDetailTableComponent implements OnInit {

  @Input() dataArray: [];
  tableDataSource_f = new BehaviorSubject<any[]>([]);
  tableDataSource = new BehaviorSubject<any[]>([]);

  displayedColumns = new BehaviorSubject<string[]>([
    'acc',
    'name',
    'term_number',
    'resources'
  ]);

  // declaration, pagination
  currentPage = new BehaviorSubject<object>({'page': 1});
  pageSize = new BehaviorSubject<number>(10);
  dataOnPage = new BehaviorSubject<any[]>([]);

  // declaration, search
  searchFormControl = new UntypedFormControl();
  sortKey = new BehaviorSubject<string>('acc');
  sortDirection = new BehaviorSubject<string>('asc');
  constructor() { }

  ngOnInit() {

    this.tableDataSource_f.next(this.dataArray);

    combineLatest(this.tableDataSource_f, this.searchFormControl.valueChanges, this.sortKey, this.sortDirection)
      .subscribe(([changedHeroData, searchTerm, sortKey, sortDirection]) => {
        const heroesArray = Object.values(changedHeroData);
        let filteredHeroes: any[];

        if (!searchTerm) {
          filteredHeroes = heroesArray;
        } else {
          const filteredResults = heroesArray.filter(hero => {
            return Object.values(hero).reduce((prev, curr) => {
              if (curr) {

                return prev || JSON.stringify(curr).toLowerCase().includes(searchTerm.toLowerCase());
              }
              return prev;
            }, false);
          });
          filteredHeroes = filteredResults;
        }

        const sortedHeroes = filteredHeroes.sort((a, b) => {
          if (a[sortKey] > b[sortKey]) {
            return sortDirection === 'asc' ? 1 : -1;
          }
          if (a[sortKey] < b[sortKey]) {
            return sortDirection === 'asc' ? -1 : 1;
          }
          return 0;
        });

        this.tableDataSource.next(sortedHeroes);
      });

    this.searchFormControl.setValue('');

    combineLatest(this.tableDataSource, this.currentPage, this.pageSize)
      .subscribe(([allSources, currentPage, pageSize]) => {
        const startingIndex = (currentPage['page'] - 1) * pageSize;
        const onPage = allSources.slice(startingIndex, startingIndex + pageSize);
        this.dataOnPage.next(onPage);
      });
  }
  exampleSearch() {
    // const exampleSearch = 'Cellular tumor antigen p53';
    const exampleSearch = 'P04637';
    this.searchFormControl.setValue(exampleSearch);
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
