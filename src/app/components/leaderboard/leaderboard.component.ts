import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { BehaviorSubject, Observable, Subject, combineLatest } from "rxjs";
import { filter, map, pluck, shareReplay, startWith, switchMap } from "rxjs/operators";
import { CuratorStatisticsModule } from "../../curator-statistics/curator-statistics.module";
import { CuratorStatisticsService } from "../../curator-statistics/services/curator-statistics.service";
import { CuratorModule } from "../../curator/curator.module";
import { CuratorService } from "../../curator/curator.service";
import { User } from "../../models/User.model";
import { Resource } from "../../models/resource.model";
import { BaseCuratorStatistics, CuratorStatistics, WeeklyCuratorStatistics } from "../../models/statistics.model";
import { ResourcesService } from "../../resource/service/resources.service";
import { AngularSvgIconModule, SvgIconRegistryService } from "angular-svg-icon";
import { Paginated } from "../../interfaces/paginated";
import { ReactiveFormsModule } from "@angular/forms";
import { ResourceModule } from "src/app/resource/resource.module";
import { RouterModule } from "@angular/router";
import { StatisticsFilter } from "../../curator-statistics/models/statistics-filter";
import { CuratorWithStats } from "../../curator-statistics/models/curator-stats";
import { LeaderboardService } from "src/app/databases/services/leaderboard.service";
import { TotalLeaderboardComponent } from "../total-leaderboard/total-leaderboard.component";
import { WeeklyLeaderboardComponent } from "../weekly-leaderboard/weekly-leaderboard.component";
import { CdkPortalOutlet } from '@angular/cdk/portal';

@Component({
  standalone: true,
  selector: "leaderboard",
  imports: [
    CommonModule,
    RouterModule,
    CuratorStatisticsModule,
    ResourceModule,
    CuratorModule,
    AngularSvgIconModule,
    ReactiveFormsModule,
    TotalLeaderboardComponent,
    WeeklyLeaderboardComponent
],
  templateUrl: "./leaderboard.component.html",
  styleUrls: ["./leaderboard.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  @Input("resource-id") resource_id: string;

  @ViewChild(CdkPortalOutlet, { static: true })
  portalOutlet: CdkPortalOutlet | undefined;

  showTotal: boolean = true;
  
  resource$: Observable<Resource>;
  statFilter$: Observable<StatisticsFilter>;
  stats$: Observable<Paginated<CuratorWithStats>>;
  statsList$: Observable<CuratorWithStats[]>;
  statsMeta$: Observable<{ pagination: { total: number; start: number; limit: number }; }>;
  statsWithUsers$: Observable<{ stat: CuratorStatistics; user: User }[]>;
  maxPage$: Observable<number>;

  destroy$ = new Subject();
  page$ = new BehaviorSubject<number>(1);
  limit = 10;

  leaderboard$: Observable<{ user: User; stat: BaseCuratorStatistics; }[]>;
  weeklyLeaderboard$: Observable<{ user: User; stat: WeeklyCuratorStatistics; }[]>;

  constructor(
    protected statService: CuratorStatisticsService,
    protected curatorService: CuratorService,
    protected resourceService: ResourcesService,
    protected svgRegistry: SvgIconRegistryService,
    protected leaderboardService: LeaderboardService
  ) {
    // preloading the loading svg icon
    this.svgRegistry.loadSvg("assets/svg/loading-spinner.svg").subscribe();
  }

  ngOnInit(): void {
    this.resource$ = this.resourceService
      .get_resource(this.resource_id)
      .pipe(shareReplay());

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

    this.leaderboard$ = this.leaderboardService.getResourceLeaderboardWithUsers(this.resource_id);
    this.weeklyLeaderboard$ = this.leaderboardService.getWeeklyResourceLeaderboardWithUsers(this.resource_id);

    // this.weeklyLeaderboard$.subscribe({
    //   next: weeklyLeaderboard => {
    //     console.log('weeklyLeaderboard observable:', weeklyLeaderboard);
    //   },
    // });

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

  showTotalLeaderboard(): void {
    this.showTotal = true;
  }

  showWeeklyLeaderboard(): void {
    this.showTotal = false;
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
