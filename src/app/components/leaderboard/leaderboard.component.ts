import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject, combineLatest, of } from "rxjs";
import {
  filter,
  map,
  pluck,
  shareReplay,
  startWith,
  switchMap,
} from "rxjs/operators";
import { CuratorStatisticsModule } from "../../curator-statistics/curator-statistics.module";
import { CuratorStatisticsService } from "../../curator-statistics/services/curator-statistics.service";
import { CuratorModule } from "../../curator/curator.module";
import { CuratorService } from "../../curator/curator.service";
import { User } from "../../models/User.model";
import { Resource } from "../../models/resource.model";
import { CuratorStatistics } from "../../models/statistics.model";
import { ResourcesService } from "../../resource/service/resources.service";
import { environment } from "src/environments/environment";
import { AngularSvgIconModule, SvgIconRegistryService } from "angular-svg-icon";
import { Paginated } from "../../interfaces/paginated";
import { ReactiveFormsModule } from "@angular/forms";
import { ResourceModule } from "src/app/resource/resource.module";
import { RouterModule } from "@angular/router";
import { StatisticsFilter } from "../../curator-statistics/models/statistics-filter";
import { CuratorWithStats } from "../../curator-statistics/models/curator-stats";

const leaderboardColumns = {
  medals_count: {
    name: "Medals",
  },
  badges_count: {
    name: "Badges",
  },
  generation_count: {
    name: "Generation Contributions",
  },
  invalidation_count: {
    name: "Invalidation Contributions",
  },
  revision_count: {
    name: "Revision Contributions",
  },
  generation_score: {
    name: "Generation Score",
  },
  invalidation_score: {
    name: "Invalidation Score",
  },
  revision_score: {
    name: "Revision Score",
  },
  total_score: {
    name: "Total Score",
  },
  total_count: {
    name: "Total Contributions",
  },
};

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
  ],
  templateUrl: "./leaderboard.component.html",
  styleUrls: ["./leaderboard.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  statsList$: Observable<CuratorWithStats[]>;
  statsWithUsers$: Observable<{ stat: CuratorStatistics; user: User }[]>;
  resource$: Observable<Resource>;

  tableColumns: string[] = [
    "medals_count",
    "badges_count",
    "generation_count",
    "invalidation_count",
    "revision_count",
    "total_score",
  ];

  apicuronURL = environment.host;
  stats$: Observable<Paginated<CuratorWithStats>>;
  statsMeta$: Observable<{
    pagination: { total: number; start: number; limit: number };
  }>;

  destroy$ = new Subject();

  page$ = new BehaviorSubject<number>(1);
  limit = 10;
  statFilter$: Observable<StatisticsFilter>;
  maxPage$: Observable<number>;

  constructor(
    protected statService: CuratorStatisticsService,
    protected curatorService: CuratorService,
    protected resourceService: ResourcesService,
    protected svgRegistry: SvgIconRegistryService
  ) {
    // preloading the loading svg icon
    this.svgRegistry.loadSvg("assets/svg/loading-spinner.svg").subscribe();
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  @Input("resource-id")
  resource_id: string;

  @Input("columns")
  set columns(value: string) {
    this.tableColumns = value
      .split(",")
      .filter((val) => Object.keys(leaderboardColumns).includes(val));
  }

  getColumnProps(col: string) {
    return leaderboardColumns[col];
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

  nextPage() {
    this.page$.next(this.page$.value + 1);
  }

  prevPage() {
    if (this.page$.value - 1 > 0) {
      this.page$.next(this.page$.value - 1);
    }
  }
}
