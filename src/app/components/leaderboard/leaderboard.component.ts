import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject, combineLatest, of } from "rxjs";
import {
  filter,
  map,
  pluck,
  share,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
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
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ResourceModule } from "src/app/resource/resource.module";
import { RouterModule } from "@angular/router";

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

export type LeaderboardQuery = {
  skip: number;
  limit: number;
  resource_id: string;
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
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  statsList$: Observable<CuratorStatistics[]>;
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
  stats$: Observable<Paginated<CuratorStatistics>>;
  statsMeta$: Observable<{
    pagination: { total: number; start: number; limit: number };
  }>;

  destroy$ = new Subject();

  page$ = new BehaviorSubject<number>(1);
  limit = 10;
  leaderboardQuery$: Observable<LeaderboardQuery>;
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

    this.leaderboardQuery$ = combineLatest([this.page$, this.resource$]).pipe(
      map(([page, resource]: [number, Resource]) => {
        return {
          limit: this.limit,
          skip: (page - 1) * this.limit,
          resource_id: resource.resource_id,
        };
      })
    );

    this.stats$ = this.leaderboardQuery$.pipe(
      filter((query: LeaderboardQuery) => {
        return !!query.resource_id;
      }),
      shareReplay(),
      switchMap(({ resource_id, skip, limit }: LeaderboardQuery) => {
        return this.statService.getResourceLeaderboard(
          resource_id,
          limit,
          skip
        );
      }),
      shareReplay()
    );
    this.statsList$ = this.stats$.pipe(pluck("data"));
    this.statsMeta$ = this.stats$.pipe(pluck("meta"));

    this.statsWithUsers$ = this.statsList$.pipe(
      switchMap((stats: CuratorStatistics[]) => {
        if(stats.length == 0){
          return of([[], []])
        }
        const users$List = stats.map(({ curator_orcid }) => {
          return this.curatorService
            .get_curator(curator_orcid)
            .pipe(map((user: any) => new User().deserialize(user)));
        });
        const usersList$ = combineLatest(users$List);
        return combineLatest([usersList$, of(stats)]);
      }),
      map(([users, stats]: [User[], CuratorStatistics[]]) => {
        return stats.map((stat) => {
          return {
            stat,
            user: users.find((user) => user.orcid_id == stat.curator_orcid),
          };
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
