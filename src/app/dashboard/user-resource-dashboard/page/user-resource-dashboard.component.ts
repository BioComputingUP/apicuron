import { Component, Injectable } from "@angular/core";
import { DashboardService } from "../../services/dashboard.service";
import { Observable } from "rxjs";
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
import { Badge } from "../../../models/badge.model";

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
  recentlyAchievedBadges$: Observable<Paginated<Badge>>;
  badgesInProgress$: Observable<Paginated<Badge>>;

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
      tap((resourceId) => console.log({ resourceId })),
      switchMap((resId) =>
        this.userResourceDashboard.getCurrentResourceStat(resId)
      )
    );

    this.detailedStatistics$ = this.resourceId$.pipe(
      switchMap((resourceId) =>
        this.userResourceDashboard.getDetailedStatistics(resourceId)
      )
    );

    this.mainNumbers$ = this.detailedStatistics$.pipe(
      map((stat) => this.userResourceDashboard.computeMainNumbers(stat))
    );

    this.recentlyAchievedBadges$ = this.resourceId$.pipe(
      switchMap((resourceId: string) => {
        return this.userResourceDashboard.getUserBadges(resourceId, 'achieved', 0, 4);
      }),
      shareReplay(1)
    );

    this.badgesInProgress$ = this.resourceId$.pipe(
      switchMap((resourceId: string) => {
        return this.userResourceDashboard.getUserBadges(resourceId, 'progress', 0, 4);
      }),
      shareReplay(1)
    );
  }

  getCurrentResourceId() {
    return this.route.paramMap.pipe(
      map((paramMap: ParamMap) => paramMap.get("resourceId") as string)
    );
  }
}
