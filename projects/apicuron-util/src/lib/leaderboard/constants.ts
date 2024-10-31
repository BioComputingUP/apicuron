import { InjectionToken } from "@angular/core";
import { LeaderboardDef } from "./interfaces/leaderboard-def.interface";
import { totalLeaderboardDef } from "./leaderboards/total-leaderboard/leaderboard-def";
import { leaderboardDef as WeeklyLeaderboardDef } from "./leaderboards/weekly-leaderboard/weekly-leaderboard-def";
import { leaderboardDef as MonthlyLeaderboardDef } from "./leaderboards/monthly-leaderboard";
export const LeaderboardsToken = new InjectionToken<LeaderboardDef[]>(
  "LeaderboardsListToken"
);

export const leaderboardsAvailable: LeaderboardDef[] = [
  MonthlyLeaderboardDef,
  totalLeaderboardDef,
  WeeklyLeaderboardDef,
];

export const defaultLeaderboardOptions = [
  MonthlyLeaderboardDef.name,
  totalLeaderboardDef.name,
  WeeklyLeaderboardDef.name,
];
