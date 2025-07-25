import { Paginated } from "../../../../../../src/app/interfaces/paginated";

export type ColumnConfig<K = unknown, ColumnNames extends string = string> = {
  fieldAccessor?: (row: K, index: number, pagination?: Paginated<K>) => any;
  columnName: ColumnNames;
  description: string;
};
export interface LeaderboardDef<
  K = unknown,
  ColumnNames extends string = string
> {
  name: string;
  label: string;
  description: string;
  columns: ColumnConfig<K, ColumnNames>[];
}
