import { Expose } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional } from 'class-validator';
import {
	MonthlyLeaderboardColumns,
	TotalLeaderboardColumns,
	WeeklyLeaderboardColumns,
} from 'src/core/schemas/components/leaderboard-preferences.schema';
export class LeaderboardSettingsDto {
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsEnum(MonthlyLeaderboardColumns, { each: true })
	@Expose()
	monthly?: MonthlyLeaderboardColumns[];

	@IsOptional()
	@IsArray()
	@ArrayNotEmpty({
		message:
			'Weekly leaderboard columns cannot be empty, include at least one column.',
	})
	@IsEnum(WeeklyLeaderboardColumns, { each: true })
	@Expose()
	weekly?: WeeklyLeaderboardColumns[];

	@IsOptional()
	@IsArray()
	@ArrayNotEmpty({
		message:
			'Total leaderboard columns cannot be empty, include at least one column.',
	})
	@IsEnum(TotalLeaderboardColumns, { each: true })
	@Expose()
	total?: TotalLeaderboardColumns[];
}
