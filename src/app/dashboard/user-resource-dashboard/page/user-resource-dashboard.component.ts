import { Component } from "@angular/core";
import { DashboardService } from "../../services/dashboard.service";
import { combineLatest, Observable } from "rxjs";
import { CuratorStatistics } from "../../../models/statistics.model";
import { User } from "../../../models/User.model";
import { UserResourceDashboardService } from "../services/user-resource-dashboard.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { map, shareReplay, switchMap, tap } from "rxjs/operators";
import { Resource } from "../../../models/resource.model";
import {
  ActivitiesStatistics,
  DetailedStatistics,
} from "../../../curator-statistics/models/curator-stats";
import { Paginated } from "../../../interfaces/paginated";
import { AchievementState, Badge } from "../../../models/badge.model";
import { MyBadgesFilter } from "../../../achievements/interfaces/achievement-filter";

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
  mainNumbers$: Observable<{ label: string; value: number | string }[]>;
  achievedFilter$: Observable<MyBadgesFilter>;
  progressFilter$: Observable<MyBadgesFilter>;
  userActivities$: Observable<ActivitiesStatistics[]>;
  activitiesAndResource$: Observable<[ActivitiesStatistics[], Resource]>;

  constructor(
    protected userResourceDashboard: UserResourceDashboardService,
    protected dashboardService: DashboardService,
    protected route: ActivatedRoute
  ) {
    this.init();
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

    this.mainNumbers$ = this.detailedStatistics$.pipe(
      map((stat) => this.userResourceDashboard.computeMainNumbers(stat))
    );

    this.activitiesAndResource$ = combineLatest([
      this.userActivities$,
      this.resource$,
    ]);

    this.achievedFilter$ = this.resourceId$.pipe(
      map((resourceId) => {
        return MyBadgesFilter.create({
          resource_id: resourceId,
          state: AchievementState.achieved,
        });
      })
    );

    this.progressFilter$ = this.resourceId$.pipe(
      map((resourceId) => {
        return MyBadgesFilter.create({
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
