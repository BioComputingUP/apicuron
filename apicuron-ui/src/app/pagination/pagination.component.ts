import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnDestroy {

  destroy$ = new Subject();


  currentPage$ = new BehaviorSubject<number>(1);
  totalCount$ = new BehaviorSubject<number>(0);
  itemsPerPage$ = new BehaviorSubject<number>(10);
  nextPage$ = new Subject();



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
      map(([totalCount, itemsPerPage]) => Math.floor(totalCount / itemsPerPage)),
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

    this.currentPage$.pipe(
      takeUntil(this.destroy$),
    ).subscribe((value: number) => {
      this.currentPageChange.emit(value)
      this.pageChanged.emit({ page: value })
    })

    this.nextPage$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.maxPage$),
      map((maxPage: number) => {
        if (this.currentPage$.value + 1 <= maxPage) {
          this.go_to_page(this.currentPage$.value + 1)
        }
      }),
    ).subscribe(() => { })


  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  go_to_page(page: number) {
    this.currentPage$.next(page)
  }


  previous_page() {
    if (this.currentPage$.value > 1) {
      this.go_to_page(this.currentPage$.value - 1)
    }
  }
  next_page() {
    this.nextPage$.next(true);
  }


  ngOnInit(): void {
  }

}
