import { InjectionToken } from "@angular/core";
import { LeaderboardDef } from "./interfaces/leaderboard-def.interface";
import { totalLeaderboardDef } from "./leaderboards/total-leaderboard/leaderboard-def";
import { leaderboardDef as WeeklyLeaderboardDef } from "./leaderboards/weekly-leaderboard/weekly-leaderboard-def";
export const LeaderboardsToken = new InjectionToken<LeaderboardDef[]>(
  "LeaderboardsListToken"
);

export const leaderboardsAvailable: LeaderboardDef[] = [
  totalLeaderboardDef,
  WeeklyLeaderboardDef,
];

export const defaultLeaderboardOptions = [
  totalLeaderboardDef.name,
  WeeklyLeaderboardDef.name,
];
