import { Paginated } from "../../../../../../src/app/interfaces/paginated";
import { LeaderboardEntry } from "../leaderboards/total-leaderboard/leaderboard-entry";

export type ColumnConfig<K = unknown> = {
  fieldAccessor?: (
    row: K,
    index: number,
    pagination?: Paginated<K>
  ) => any;
  columnName: string;
  description: string;
};
export interface LeaderboardDef<K = unknown> {
  name: string;
  label: string;
  description: string;
  columns: ColumnConfig<K>[];
}

