export const LeaderboardColumns = {
	Ranking: 'ranking',
	Contributor: 'contributor',
	'Generation Contributions': 'generation_score',
	'Invalidation Contributions': 'invalidation_score',
	'Revision Contributions': 'revision_score',
	'Total Score': 'total_score',
	'Last Contribution Date': 'last_contribution_date',
	Medals: 'medals_count',
	Badges: 'badges_count',
} as const;

export type LeaderboardColumns = keyof typeof LeaderboardColumns;
// type BaseLeaderBoardSettings<
// 	LType extends LeaderboardType,
// 	AllowedColumns extends LeaderBoardColumns = LeaderBoardColumns,
// > = Record<LType, AllowedColumns[]>;

type MonthlyLeaderboardColumns = Exclude<
	LeaderboardColumns,
	'Medals' | 'Badges'
>;
type WeeklyLeaderboardColumns = Exclude<
	LeaderboardColumns,
	'Medals' | 'Badges'
>;
type TotalLeaderboardColumns = LeaderboardColumns;

// export type MonthlyLeaderBoardSettings = BaseLeaderBoardSettings<
// 	'monthly',
// 	MonthlyLeaderBoardColumns
// >;
// export type WeeklyLeaderBoardSettings = BaseLeaderBoardSettings<
// 	'weekly',
// 	WeeklyLeaderBoardColumns
// >;
// export type TotalLeaderBoardSettings = BaseLeaderBoardSettings<
// 	'total',
// 	TotalLeaderBoardColumns
// >;

// Combined type allowing an object with any/all of the three settings
// export type LeaderBoardSettings = Partial<
// 	MonthlyLeaderBoardSettings &
// 		WeeklyLeaderBoardSettings &
// 		TotalLeaderBoardSettings
// >;
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
