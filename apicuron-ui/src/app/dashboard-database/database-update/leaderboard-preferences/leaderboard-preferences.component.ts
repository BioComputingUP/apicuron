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
  styleUrls: ["./leaderboard-preferences.component.scss"],
})
export class LeaderboardPreferencesComponent {
  @Input() leaderboard_preferences_group: FormGroup;

  all_lb_preferences = {
    monthly: MonthlyLeaderboardColumns,
    weekly: WeeklyLeaderboardColumns,
    total: TotalLeaderboardColumns,
  };
}
