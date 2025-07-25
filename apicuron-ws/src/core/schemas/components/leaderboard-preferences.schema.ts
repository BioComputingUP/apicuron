type ObjectValues<T> = T[keyof T];
const LeaderboardColumns = {
	ranking: 'Ranking',
	contributor: 'Contributor',
	generation_score: 'Generation Contributions',
	invalidation_score: 'Invalidation Contributions',
	revision_score: 'Revision Contributions',
	total_score: 'Total Score',
	last_contribution_date: 'last Contribution Date',
} as const;

export type LeaderboardColumns = ObjectValues<typeof LeaderboardColumns>;

export const MonthlyLeaderboardColumns = LeaderboardColumns;
export type MonthlyLeaderboardColumns = LeaderboardColumns;

export const WeeklyLeaderboardColumns = LeaderboardColumns;
export type WeeklyLeaderboardColumns = LeaderboardColumns;

export const TotalLeaderboardColumns = {
	...LeaderboardColumns,
	medals_count: 'Medals',
	badges_count: 'Badges',
} as const;

export type TotalLeaderboardColumns = keyof typeof TotalLeaderboardColumns;
export const LeaderboardTypes = {
	monthly: 'monthly',
	weekly: 'weekly',
	total: 'total',
} as const;

export type LeaderboardType = keyof typeof LeaderboardTypes;

export class LeaderboardSettings {
	[LeaderboardTypes.monthly]?: MonthlyLeaderboardColumns[];
	[LeaderboardTypes.weekly]?: WeeklyLeaderboardColumns[];
	[LeaderboardTypes.total]?: TotalLeaderboardColumns[];
}
