import { Paginated } from "../../../../../../../src/app/interfaces/paginated";
import { TotalLeaderboardColumns } from "../../interfaces/leaderboard-columns.types";
import { LeaderboardDef } from "../../interfaces/leaderboard-def.interface";
import { LeaderboardEntry } from "./leaderboard-entry";

export const totalLeaderboardDef: LeaderboardDef<
  LeaderboardEntry,
  TotalLeaderboardColumns
> = {
  name: "total-leaderboard",
  label: "Total Leaderboard",
  description: "The total leaderboard of all users.",
  columns: [
    {
      fieldAccessor: (
        row: LeaderboardEntry,
        index: number,
        pagination?: Paginated<LeaderboardEntry>
      ) => (pagination.meta.pagination.start ?? 0) + index,
      columnName: "Ranking",
      description: "The ranking of the curator based on their total score.",
    },
    {
      fieldAccessor: (row: LeaderboardEntry, index: number) => row.user,
      columnName: "Contributor",
      description: "The contributor",
    },
    {
      fieldAccessor: (row: LeaderboardEntry, index: number) =>
        row.stat.medals_count,
      columnName: "Medals",
      description: "The total number of medals earned by the user.",
    },
    {
      fieldAccessor: (row: LeaderboardEntry, index: number) =>
        row.stat.badges_count,
      columnName: "Badges",
      description: "The total number of badges earned by the user.",
    },
    {
      //   field: "generation_count",
      fieldAccessor: (row: LeaderboardEntry, index: number) =>
        row.stat.generation_count,
      columnName: "Generation Contributions",
      description:
        "The number of contributions made by the user when generating content.",
    },
    {
      //   field: "invalidation_count",
      fieldAccessor: (row: LeaderboardEntry, index: number) =>
        row.stat.invalidation_count,
      columnName: "Invalidation Contributions",
      description:
        "The number of contributions made by the user when invalidating content.",
    },
    {
      //   field: "revision_count",
      fieldAccessor: (row: LeaderboardEntry, index: number) =>
        row.stat.revision_count,
      columnName: "Revision Contributions",
      description:
        "The number of contributions made by the user when revising content.",
    },
    {
      //   field: "total_score",
      fieldAccessor: (row: LeaderboardEntry, index: number) =>
        row.stat.total_score,
      columnName: "Total Score",
      description:
        "The cumulative score of the user based on various contributions.",
    },
    {
      //   field: "last_contribution",
      fieldAccessor: (row: LeaderboardEntry, index: number) =>
        row.stat.last_contribution,
      columnName: "last Contribution Date",
      description: "The date of the user's last contribution.",
    },
  ],
};
