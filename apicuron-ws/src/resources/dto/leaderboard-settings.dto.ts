import { Expose } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import {
	MonthlyLeaderboardColumns,
	TotalLeaderboardColumns,
	WeeklyLeaderboardColumns,
} from 'src/core/schemas/components/leaderboard-preferences.schema';
export class LeaderboardSettingsDto {
	@IsOptional()
	@IsArray()
	@IsEnum(MonthlyLeaderboardColumns, { each: true })
	@Expose()
	monthly?: MonthlyLeaderboardColumns[];

	@IsOptional()
	@IsArray()
	@IsEnum(WeeklyLeaderboardColumns, { each: true })
	@Expose()
	weekly?: WeeklyLeaderboardColumns[];

	@IsOptional()
	@IsArray()
	@IsEnum(TotalLeaderboardColumns, { each: true })
	@Expose()
	total?: TotalLeaderboardColumns[];
}
