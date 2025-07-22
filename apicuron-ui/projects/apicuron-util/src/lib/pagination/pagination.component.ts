import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
  of,
} from "rxjs";
import { distinctUntilChanged, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { Paginated } from "../../../../../src/app/interfaces/paginated";
import { Replay } from "@sentry/angular-ivy";
import { UpdatePagePayload } from "./interfaces";
import { Pagination } from "./pagination";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: "pagination",
  templateUrl: "./pagination.component.html",
})
export class PaginationComponent implements OnInit, OnDestroy {
  paginated$ = new ReplaySubject<Paginated<any>>();
  paginationData$: Observable<Pagination>;
  pageUpdated$ = new Subject<number>();
  destroy$ = new Subject<void>();

  @Input("paginated") set paginatedData(value: Paginated<any>) {
    this.paginated$.next(value);
  }
  @Input() maxSize = 5;

  @Output() pageChanged = new EventEmitter<UpdatePagePayload>();

  constructor() {
    this.paginationData$ = this.paginated$.pipe(
      map((paginated) => new Pagination(paginated, this.maxSize))
    );

    this.pageUpdated$
      .pipe(
        distinctUntilChanged(),
        switchMap((page) => combineLatest([of(page), this.paginated$.pipe(take(1))])),
        map(([page, paginated]: [number, Paginated<any>]) => {
          return {
            page,
            limit: paginated.meta.pagination.limit,
            skip: (page - 1) * paginated.meta.pagination.limit,
          };
        }),
        tap((pageUpdate) => {
          this.pageChanged.emit(pageUpdate);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {});
  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }

  updatePage(page: number) {
    this.pageUpdated$.next(page);
  }

  ngOnInit(): void {}
}
