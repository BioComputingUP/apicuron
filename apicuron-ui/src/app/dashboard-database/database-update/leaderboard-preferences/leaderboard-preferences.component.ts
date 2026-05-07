import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import {
  MonthlyLeaderboardColumns,
  TotalLeaderboardColumns,
  WeeklyLeaderboardColumns,
} from "projects/apicuron-util/src/lib/leaderboard/interfaces/leaderboard-columns.types";

@Component({
  selector: "leaderboard-preferences",
  templateUrl: "./leaderboard-preferences.component.html",
})
export class LeaderboardPreferencesComponent {
  @Input() leaderboard_preferences_group: FormGroup;

  all_lb_preferences = {
    monthly: MonthlyLeaderboardColumns,
    weekly: WeeklyLeaderboardColumns,
    total: TotalLeaderboardColumns,
  };
  leaderboardSections = [
    {
      key: "monthly",
      label: "Monthly Leaderboard Columns",
      icon: "assets/svg/month.svg",
    },
    {
      key: "weekly",
      label: "Weekly Leaderboard Columns",
      icon: "assets/svg/weekly.svg",
    },
    {
      key: "total",
      label: "Total Leaderboard Columns",
      icon: "assets/svg/total.svg",
    },
  ];
}
