export type LeaderboardOption = string | [string, string[]];
export type LeaderboardOptions = LeaderboardOption[];

export type LeaderboardParsedOption = {
	leaderboard: string;
	label: string;
	columns: string[];
}