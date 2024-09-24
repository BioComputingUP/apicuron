import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject, combineLatest } from 'rxjs';
import { Resource } from 'src/app/models/resource.model';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { LeaderboardLibModule } from './leaderboard-lib.module';
import { LeaderboardLibService } from './leaderboard-lib.service';
import { TableCellComponent } from './table-cell/table-cell.component';
import { ELEMENT_TOKEN, TableConfig } from './element-token';
import { LeaderboardEntry } from './interfaces/leaderboard-entry';
import { Paginated } from 'src/app/interfaces/paginated';
import { LeaderboardFilter } from './interfaces/leaderboard-filter';
import { map, switchMap } from 'rxjs/operators';
@Component({
  standalone: true,
  selector: 'lib-leaderboard-lib',
  templateUrl: "../lib/leaderboard-lib.component.html",
  imports: [CommonModule, CdkTableModule, LeaderboardLibModule, NgComponentOutlet, TableCellComponent],
  styles: []
})
export class LeaderboardLibComponent implements OnInit, OnDestroy {
  cellComponent = TableCellComponent;
  myInjector: Injector;

  destroy$ = new Subject();

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  columnMapping = {
    medals_count: 'Medals',
    badges_count: 'Badges',
    generation_count: 'Generation Contributions',
    invalidation_count: 'Invalidation Contributions',
    revision_count: 'Revision Contributions',
    total_score: 'Total Score',
    last_contribution: 'Last Contribution Date',
  };

  columns: string[] = Object.keys(this.columnMapping); 

  leaderboard$: Observable<Paginated<LeaderboardEntry>>;
  leaderboardFilter$: Observable<LeaderboardFilter>;

  page$ = new BehaviorSubject<number>(1);
  limit = 10;

  constructor(
    private injector: Injector,
    private leaderboardLibService: LeaderboardLibService,
  ) {}

  resource$: ReplaySubject<Resource> = new ReplaySubject<Resource>(1);
  @Input("resource") set resource(value: Resource) {
    this.resource$.next(value);
  }

  ngOnInit(): void {
    this.leaderboardFilter$ = combineLatest([this.resource$, this.page$]).pipe(
      map(([resource, page]: [Resource, number]) => {
        return new LeaderboardFilter(
          resource.resource_id,
          (page - 1) * this.limit,
          this.limit
        );
      })
    );

    this.leaderboard$ = this.leaderboardFilter$.pipe(
      switchMap((filter: LeaderboardFilter) =>
        this.leaderboardLibService.getResourceLeaderboard(filter)
      )
    );

    // this.leaderboard$.subscribe({
    //   next: (leaderboardData) => {
    //     console.log('Leaderboard Data:', leaderboardData);
    //   }
    // });
  }

  createInjector(element: TableConfig): Injector {
    return Injector.create({
      providers: [{ 
          provide: ELEMENT_TOKEN, 
          useValue: element },
        ],
      parent: this.injector
    });
  }
}