import { InjectionToken } from '@angular/core';

export interface TableConfig {
  columnDefs: ColumnDef[];
}

export interface ColumnDef {
  field: string;
  columnName: string;
}

export const TABLE_CONFIG = new InjectionToken<TableConfig>('TableConfig');