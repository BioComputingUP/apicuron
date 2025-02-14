import { Component } from "@angular/core";
import { DashboardService } from "../../services/dashboard.service";
import { combineLatest, Observable, Subject } from "rxjs";
import { CuratorStatistics } from "../../../models/statistics.model";
import { User } from "../../../models/User.model";
import { UserResourceDashboardService } from "../services/user-resource-dashboard.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { map, shareReplay, startWith, switchMap } from "rxjs/operators";
import { Resource } from "../../../models/resource.model";
import {
  ActivitiesStatistics,
  DetailedStatistics,
} from "../../../curator-statistics/models/curator-stats";
import { AchievementState } from "../../../models/badge.model";
import { MyBadgesFilter } from "../../../achievements/interfaces/achievement-filter";
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from "@angular/cdk/layout";
import { Term } from "../../../models/term.model";

@Component({
  selector: "user-resource-dashboard",
  templateUrl: "./user-resource-dashboard.component.html",
  styleUrls: [],
})
export class UserResourceDashboard {
  user$: Observable<User>;
  statistics$: Observable<CuratorStatistics>;
  resourceId$: Observable<string>;
  resource$: Observable<Resource>;
  detailedStatistics$: Observable<DetailedStatistics>;
  mainNumbers$: Observable<
    { label: string; value: number | string; iconSrc: string }[]
  >;
  achievedFilter$: Observable<MyBadgesFilter>;
  progressFilter$: Observable<MyBadgesFilter>;
  userActivities$: Observable<ActivitiesStatistics[]>;
  activitiesAndResource$: Observable<[ActivitiesStatistics[], Resource]>;
  destroy$ = new Subject();
  limit$: Observable<number>;
  terms$: Observable<Term[]>;

  constructor(
    protected userResourceDashboard: UserResourceDashboardService,
    protected dashboardService: DashboardService,
    protected route: ActivatedRoute,
    protected breakpointObserver: BreakpointObserver
  ) {
    this.init();
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  init() {
    this.resourceId$ = this.getCurrentResourceId();
    this.user$ = this.dashboardService.user$;
    this.resource$ = this.resourceId$.pipe(
      switchMap((resId) => this.userResourceDashboard.getCurrentResource(resId))
    );
    this.statistics$ = this.resourceId$.pipe(
      switchMap((resId) =>
        this.userResourceDashboard.getCurrentResourceStat(resId)
      )
    );

    this.detailedStatistics$ = this.resourceId$.pipe(
      switchMap((resourceId) =>
        this.userResourceDashboard.getDetailedStatistics(resourceId)
      ),
      shareReplay(1)
    );

    this.userActivities$ = this.detailedStatistics$.pipe(
      map((stat) => stat.activities)
    );

    // this.terms$ = combineLatest([
    //   this.detailedStatistics$,
    //   this.resource$,
    // ]).pipe(
    //   map(([stat, resource]) =>
    //     stat.activities.map((act): Term => act.getTerm(resource.resource_id))
    //   )
    // );

    this.mainNumbers$ = this.detailedStatistics$.pipe(
      map((stat) => this.userResourceDashboard.computeMainNumbers(stat))
    );

    this.activitiesAndResource$ = combineLatest([
      this.userActivities$,
      this.resource$,
    ]);
    const screenIsLarge$ = this.breakpointObserver
      .observe([Breakpoints.XLarge])
      .pipe(
        map((state: BreakpointState) => state.breakpoints[Breakpoints.XLarge]),
        startWith(this.breakpointObserver.isMatched(Breakpoints.XLarge))
      );

    this.limit$ = screenIsLarge$.pipe(map((isLarge) => (isLarge ? 6 : 4)));

    this.achievedFilter$ = combineLatest([this.resourceId$, this.limit$]).pipe(
      map(([resourceId, limit]) => {
        return MyBadgesFilter.create({
          limit,
          resource_id: resourceId,
          state: AchievementState.achieved,
        });
      })
    );

    this.progressFilter$ = combineLatest([this.resourceId$, this.limit$]).pipe(
      map(([resourceId, limit]) => {
        return MyBadgesFilter.create({
          limit,
          resource_id: resourceId,
          state: AchievementState.progress,
          sortBy: "progress_rate",
          sortOrder: -1,
        });
      })
    );
  }

  getCurrentResourceId() {
    return this.route.paramMap.pipe(
      map((paramMap: ParamMap) => paramMap.get("resourceId") as string)
    );
  }
}
