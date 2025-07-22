import { Injectable } from "@angular/core";
import { DashboardService } from "../../services/dashboard.service";
import { map } from "rxjs/operators";
import { CuratorStatisticsService } from "../../../curator-statistics/services/curator-statistics.service";
import {
  ActivitiesStatistics,
  DetailedStatistics,
} from "../../../curator-statistics/models/curator-stats";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

@Injectable()
export class UserResourceDashboardService {
  constructor(
    protected dashboardService: DashboardService,
    protected statService: CuratorStatisticsService,
    protected http: HttpClient
  ) {}

  wsUrl = environment.ws;

  getCurrentResource(resource_id: string) {
    return this.dashboardService.contributedResources$.pipe(
      map((resources) => {
        const resource = resources.find(
          (resource) => resource.resource_id === resource_id
        );
        if (!resource) {
          throw new Error("Resource not found in contributed resources");
        }
        return resource;
      })
    );
  }

  getCurrentResourceStat(resource_id: string) {
    return this.dashboardService.userStats$.pipe(
      map((stats) => {
        const stat = stats.find((stat) => stat.resource_id == resource_id);
        if (!stat) {
          throw new Error("Resource not found in user stats");
        }
        return stat;
      })
    );
  }
  getDetailedStatistics(resourceId: string) {
    return this.dashboardService
      .getDetailedStatistics(resourceId)
      .pipe(map((stats) => stats[0] ?? null));
  }

  computeMainNumbers(stat: DetailedStatistics) {
    const mostPerformedActivity = stat.activities.reduce(
      (acc, curr) => {
        if (acc.count < curr.count) {
          return curr;
        }
        return acc;
      },
      { count: 0 } as ActivitiesStatistics
    );
    const activityEntries: { label: string; value: number | string; iconSrc: string }[] = [
      { label: "Contributions made", value: stat.total_count, iconSrc: "assets/svg/contribution.svg" },
      { label: "Last month contributions", value: stat.last_month_count, iconSrc: "assets/svg/month.svg" },
      { label: "Last week contributions", value: stat.last_week_count, iconSrc: "assets/svg/week.svg" },
      {
        label: "Last quarter contributions",
        value: stat.last_quarter_count,
        iconSrc: "assets/svg/graph.svg"
      },
    ];
    if (mostPerformedActivity.count > 0) {
      activityEntries.push({
        label: `Most performed activitiy, (done ${mostPerformedActivity.count} times)`,
        value: mostPerformedActivity.activity_name,
        iconSrc: "assets/svg/winner.svg"
      });
    }
    return activityEntries;
  }

  //   getUserBadges(
  //     filter: MyBadgesFilter
  //   ) {
  //     return this}
}
