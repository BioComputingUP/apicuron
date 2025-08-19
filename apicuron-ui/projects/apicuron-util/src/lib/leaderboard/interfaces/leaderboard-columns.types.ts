type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
const BaseColumns = [
  "Ranking",
  "Total Score",
  "last Contribution Date",
  "Contributor",
  "Generation Contributions",
  "Invalidation Contributions",
  "Revision Contributions",
] as const;

export type LeaderboardEnumType = "monthly" | "weekly" | "total";

export const MonthlyLeaderboardColumns = [...BaseColumns] as const;
export const WeeklyLeaderboardColumns = [...BaseColumns] as const;
export const TotalLeaderboardColumns = [
  ...BaseColumns,
  "Badges",
  "Medals",
] as const;
export type MonthlyLeaderboardColumns = ArrayElement<
  typeof MonthlyLeaderboardColumns
>;
export type WeeklyLeaderboardColumns = ArrayElement<
  typeof WeeklyLeaderboardColumns
>;
export type TotalLeaderboardColumns = ArrayElement<
  typeof TotalLeaderboardColumns
>;
