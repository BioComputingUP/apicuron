import { Inject, Injectable, InjectionToken } from "@angular/core";
import {
  ColumnConfig,
  LeaderboardDef,
} from "../interfaces/leaderboard-def.interface";
import { BehaviorSubject, Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

export const LeaderboardDefToken = new InjectionToken<LeaderboardDef>(
  "LeaderboardDefToken"
);

@Injectable()
export class ColumnManagerService {
  columns: ColumnConfig[];
  columnNames: string[];

  public selectedColumns$: BehaviorSubject<string[]>;

  constructor(
    @Inject(LeaderboardDefToken) protected leaderboardDef: LeaderboardDef
  ) {
    this.columns = this.leaderboardDef.columns;
    this.columnNames = this.columns.map((col) => col.columnName);
    this.selectedColumns$ = new BehaviorSubject<string[]>(this.columnNames);
  }

  filterColumns(columns: string[]): ColumnConfig[] {
    return columns
      .map((colName: string) => {
        const foundIndex = this.columns.findIndex(
          (col) => col.columnName === colName
        );
        if (foundIndex == -1) {
          console.warn(
            `Column ${colName} not found in leaderboard "${this.leaderboardDef.label}" columns. The leaderboard defines the following columns ${this.columnNames}`
          );
          return null;
        }
        return this.columns[foundIndex];
      })
      .filter((col) => !!col && col != null);
  }

  getColumns(columns$: Observable<string[]>): Observable<ColumnConfig[]> {
    return columns$.pipe(
      map((columns: string[]) => this.filterColumns(columns)),
      shareReplay(1)
    );
  }
}
