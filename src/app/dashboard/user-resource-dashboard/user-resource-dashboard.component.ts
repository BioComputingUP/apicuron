import { Component, Injectable } from "@angular/core";
import { DashboardService } from "../services/dashboard.service";
import { Observable } from "rxjs";
import { CuratorStatistics } from "../../models/statistics.model";
import { User } from "../../models/User.model";

@Component({
  selector: "user-resource-dashboard",
  templateUrl: "./user-resource-dashboard.component.html",
  styleUrls: [],
})
export class UserResourceDashboard {
  user$: Observable<User>;
  statistics$: Observable<CuratorStatistics[]>;

  constructor(protected dashboardService: DashboardService) {
    this.user$ = this.dashboardService.user$;
    this.statistics$ = this.dashboardService.userStats$;
  }
}
