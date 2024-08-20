import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { LeaderboardService } from 'src/app/databases/services/leaderboard.service';
import { User } from 'src/app/models/User.model';
import { Resource } from 'src/app/models/resource.model';
import { BaseCuratorStatistics, CuratorStatistics, WeeklyCuratorStatistics } from 'src/app/models/statistics.model';
import { ResourcesService } from 'src/app/resource/service/resources.service';
import { AngularSvgIconModule } from "angular-svg-icon";
import { WeeklyBarChartComponent } from "../weekly-bar-chart/weekly-bar-chart.component";
import { RouterModule } from '@angular/router';
import { CuratorWithStats } from 'src/app/curator-statistics/models/curator-stats';
import { StatisticsFilter } from 'src/app/curator-statistics/models/statistics-filter';
import { Paginated } from 'src/app/interfaces/paginated';
import { filter, map, pluck, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { CuratorStatisticsService } from 'src/app/curator-statistics/services/curator-statistics.service';
import { TableMedalsComponent } from '../table-medals/table-medals.component';
import { TableGenerationComponent } from '../table-generation/table-generation.component';
import { TableBadgesComponent } from '../table-badges/table-badges.component';
import { TableInvalidationComponent } from '../table-invalidation/table-invalidation.component';
import { TableRevisionComponent } from '../table-revision/table-revision.component';
import { TableTotalComponent } from '../table-total/table-total.component';
import { TableLastDateComponent } from '../table-last-date/table-last-date.component';
import { TableChartComponent } from '../table-chart/table-chart.component';
@Component({
  standalone: true,
  selector: 'leaderboard-table',
  templateUrl: './leaderboard-table.component.html',
  imports: [
    CommonModule,
    AngularSvgIconModule,
    RouterModule,
    WeeklyBarChartComponent,
    TableMedalsComponent,
    TableBadgesComponent,
    TableGenerationComponent,
    TableInvalidationComponent,
    TableRevisionComponent,
    TableTotalComponent,
    TableLastDateComponent,
    TableChartComponent
  ]
})
export class LeaderboardTableComponent implements OnInit, OnDestroy {
  @Input() leaderboard$: Observable<{ user: User; stat: BaseCuratorStatistics | WeeklyCuratorStatistics }[]>;
  @Input() tableColumns: string[] = [];
  @Input() isWeekly: boolean = false;
  @Input() resource$: Observable<Resource>;
  
  statFilter$: Observable<StatisticsFilter>;
  stats$: Observable<Paginated<CuratorWithStats>>;
  statsWithUsers$: Observable<{ stat: CuratorStatistics; user: User }[]>;
  statsList$: Observable<CuratorWithStats[]>;
  statsMeta$: Observable<{ pagination: { total: number; start: number; limit: number }; }>;
  maxPage$: Observable<number>;

  destroy$ = new Subject();
  page$ = new BehaviorSubject<number>(1);
  limit = 10;

  paginatedLeaderboard$: Observable<{ user: User; stat: BaseCuratorStatistics | WeeklyCuratorStatistics }[]>;

  constructor(
    protected leaderboardService: LeaderboardService,
    protected resourceService: ResourcesService,
    protected statService: CuratorStatisticsService,
  ) {}

  ngOnInit(): void {
    this.paginatedLeaderboard$ = combineLatest([this.leaderboard$, this.page$]).pipe(
      map(([leaderboard, page]) => {
        const start = (page - 1) * this.limit;
        const end = start + this.limit;
        return leaderboard.slice(start, end);
      }),
      shareReplay()
    );

    this.statFilter$ = combineLatest([this.page$, this.resource$]).pipe(
      map(([page, resource]: [number, Resource]) => {
        const filter = new StatisticsFilter();
        filter.limit = this.limit;
        filter.skip = (page - 1) * this.limit;
        filter.resources = [resource.resource_id];
        filter.sortOrder = -1;
        filter.sortBy = "total_score";
        return filter;
      }),
      shareReplay()
    );
    
    this.stats$ = this.statFilter$.pipe(
      filter((filter: StatisticsFilter) => {
        return !!filter.resources && filter.resources.length > 0;
      }),
      shareReplay(),
      switchMap((filter: StatisticsFilter) => {
        return this.statService.getStatistics(filter);
      }),

      shareReplay()
    );
    
    this.statsList$ = this.stats$.pipe(pluck("data"));
    this.statsMeta$ = this.stats$.pipe(pluck("meta"));
    
    this.statsWithUsers$ = combineLatest([
      this.statsList$,
      this.statFilter$,
    ]).pipe(
      map(([stats, filter]: [CuratorWithStats[], StatisticsFilter]) => {
        return stats.map((entry: CuratorWithStats, index: number) => {
          const stat = entry.stats.find(
            (stat) => stat.resource_id == filter.resources[0]
          );
          stat.ranking = filter.skip + index + 1;

          const user = new User().deserialize(entry);
          return { user, stat };
        });
      })
    );

    this.maxPage$ = this.statsMeta$.pipe(
      map((meta) => {
        return meta.pagination.total / meta.pagination.limit;
      }),
      startWith(1)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
  
  nextPage() {
    this.page$.next(this.page$.value + 1);
  }

  prevPage() {
    if (this.page$.value - 1 > 0) {
      this.page$.next(this.page$.value - 1);
    }
  }
}

