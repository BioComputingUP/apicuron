import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {


  currentPage$ = new BehaviorSubject<number>(1);
  totalCount$ = new BehaviorSubject<number>(0);
  itemsPerPage$ = new BehaviorSubject<number>(10);


  pageList$: Observable<number[]>;
  maxPage$: Observable<number>;

  @Input() set totalItems(value: number) {
    if (value && typeof value == 'number') {
      this.totalCount$.next(value)
    }
  }
  @Input() set itemsPerPage(value: number) {
    if (value && typeof value == 'number') {
      this.itemsPerPage$.next(value)
    }
  }

  @Input('ngModel')
  set currentPage(value: number) {
    this.currentPage$.next(value);
  }

  @Output('ngModelChange') currentPageChange = new EventEmitter();

  @Output() pageChanged = new EventEmitter();

  @Input() maxSize = 5;

  constructor() {

    this.maxPage$ = combineLatest([this.totalCount$, this.itemsPerPage$]).pipe(
      map(([totalCount, itemsPerPage]) => Math.round(totalCount / itemsPerPage))
    )

    this.pageList$ = combineLatest([
      this.currentPage$,
      this.maxPage$,
    ]).pipe(map(([currentPage, maxPage]) => {
      const button_count = maxPage < this.maxSize ? maxPage : this.maxSize
      const maxButton = button_count - 1;

      if (currentPage < maxButton) {
        return [...Array(button_count).keys()].map(x => x + 1);
      }
      if (currentPage > (maxPage - maxButton)) {
        return [...Array(button_count).keys()].map(x => x + (maxPage - maxButton))
      }
      return [...Array(button_count).keys()].map(x => x + currentPage - Math.floor(maxButton / 2))
    }))
  }


  pages_list() {
    // if the total number of pages is smaller than the total number of items, we use the maximum number of pages instead
    const button_count = this.max_page < this.maxSize ? this.max_page : this.maxSize
    if (this.currentPage < button_count) {
      return [...Array(button_count).keys()].map(x => x + 1);
    }
    if (this.currentPage > (this.max_page - button_count)) {
      return [...Array(button_count).keys()].map(x => x + (this.max_page - button_count))
    }
    return [...Array(button_count).keys()].map(x => x + this.currentPage - Math.floor(button_count / 2))
  }

  go_to_page(page: number) {
    console.log('go to page' + page)
    console.log({ pageList: this.pages_list() })
    this.currentPageChange.emit(page)
    this.pageChanged.emit({ page })
    this.currentPage = page;
  }


  get max_page() {
    return Math.round(this.totalItems / this.itemsPerPage);
  }

  previous_page() {
    if (this.currentPage > 1) {
      this.go_to_page(this.currentPage - 1)
    }
  }
  next_page() {
    if (this.currentPage + 1 <= this.max_page) {
      this.go_to_page(this.currentPage + 1)
    }
  }


  ngOnInit(): void {
    console.log({
      page_list: this.pages_list(),
      max_page: this.max_page,
      totalItems: this.totalItems,
      itemsPerPage: this.itemsPerPage
    })
  }

}
