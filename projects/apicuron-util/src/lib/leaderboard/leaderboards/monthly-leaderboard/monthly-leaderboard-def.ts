import { Paginated } from "../../../../../../../src/app/interfaces/paginated";
import { LeaderboardDef } from "../../interfaces/leaderboard-def.interface";
import { MonthlyLeaderboardEntry } from "./monthly-leaderboard.entry";

export const leaderboardDef: LeaderboardDef<MonthlyLeaderboardEntry> = {
  name: "monthly-leaderboard",
  label: "Monthly Leaderboard",
  description: "The total leaderboard of the current month",
  columns: [
    {
      fieldAccessor: (
        row: MonthlyLeaderboardEntry,
        index: number,
        pagination?: Paginated<MonthlyLeaderboardEntry>
      ) => (pagination.meta.pagination.start ?? 0) + index,
      columnName: "Ranking",
      description: "The ranking of the curator based on their total score.",
    },
    {
      fieldAccessor: (row: MonthlyLeaderboardEntry, index: number) => row.user,
      columnName: "Contributor",
      description: "The contributor",
    },

    {
      //   field: "generation_count",
      fieldAccessor: (row: MonthlyLeaderboardEntry, index: number) =>
        row.stat.generation_count,
      columnName: "Generation Contributions",
      description:
        "The number of contributions made by the user when generating content.",
    },
    {
      //   field: "invalidation_count",
      fieldAccessor: (row: MonthlyLeaderboardEntry, index: number) =>
        row.stat.invalidation_count,
      columnName: "Invalidation Contributions",
      description:
        "The number of contributions made by the user when invalidating content.",
    },
    {
      //   field: "revision_count",
      fieldAccessor: (row: MonthlyLeaderboardEntry, index: number) =>
        row.stat.revision_count,
      columnName: "Revision Contributions",
      description:
        "The number of contributions made by the user when revising content.",
    },
    {
      //   field: "total_score",
      fieldAccessor: (row: MonthlyLeaderboardEntry, index: number) =>
        row.stat.total_score,
      columnName: "Total Score",
      description:
        "The cumulative score of the user based on various contributions.",
    },
    {
      //   field: "last_contribution",
      fieldAccessor: (row: MonthlyLeaderboardEntry, index: number) =>
        row.stat.last_contribution,
      columnName: "last Contribution Date",
      description: "The date of the user's last contribution this week",
    },
  ],
};
