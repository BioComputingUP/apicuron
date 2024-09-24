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
import { sortBy } from "lodash";
import { Badge } from "../../../models/badge.model";
import { Paginated } from "../../../interfaces/paginated";

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
    const activityEntries: { label: string; value: number | string }[] = [
      { label: "Contributions Made", value: stat.total_count },
      { label: "Last month contributions", value: stat.last_month_count },
      { label: "Last week contributions", value: stat.last_week_count },
      {
        label: "Last Quarter contributions",
        value: stat.last_quarter_count,
      },
    ];
    if (mostPerformedActivity.count > 0) {
      activityEntries.push({
        label: `Most performed Activitiy, (done ${mostPerformedActivity.count} times)`,
        value: mostPerformedActivity.activity_name,
      });
    }
    return activityEntries;
  }

  getUserBadges(
    resourceId: string,
    state: "achieved" | "progress" = "achieved",
    skip: number = 0,
    limit: number = 4,
    sortBy: "achieved_at" | "count_threshold" = "achieved_at",
    sortOrder: -1 | 1 | "asc" | "desc" = -1
  ) {
    return this.http
      .get(`${this.wsUrl}/achievements/my-badges`, {
        params: {
          resource_id: resourceId,
          state,
          sortBy,
          sortOrder,
          limit,
          skip,
        },
        headers: {
          Version: "2",
        },
      })
      .pipe(
        map((response: Paginated<Badge>) => {
          response.data = response.data.map((badge: Badge) =>
            new Badge().deserialize(badge)
          );
          return response as Paginated<Badge>;
        })
      );
  }
}
