import { Component, Inject, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Resource } from 'src/app/models/resource.model';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { TABLE_CONFIG, ColumnDef, TableConfig } from './leaderboard-config';
import { LeaderboardLibModule } from './leaderboard-lib.module';

@Component({
  standalone: true,
  selector: 'lib-leaderboard-lib',
  templateUrl: "../lib/leaderboard-lib.component.html",
  imports: [CommonModule, CdkTableModule, LeaderboardLibModule],
  styles: []
})
export class LeaderboardLibComponent implements OnInit {
  columns: string[] = [
    'medals_count', 
    'badges_count', 
    'generation_count', 
    'invalidation_count', 
    'revision_count', 
    'total_count', 
    'last_contribution',
  ];

  table: ColumnDef[] = [];

  constructor(@Inject(TABLE_CONFIG) private config: TableConfig) { }

  data = [
    { 
      medals_count: 15,
      badges_count: 10,
      generation_count: 5,
      invalidation_count: 2,
      revision_count: 7,
      total_count: 24,
      last_contribution: new Date(),
    },
  ];

  resource$: ReplaySubject<Resource> = new ReplaySubject<Resource>(1);
  @Input("resource") set resource(value: Resource) {
    this.resource$.next(value);
  }

  ngOnInit(): void {
    this.columns = this.config.columnDefs.map(col => col.field);
    this.table = this.config.columnDefs;
  }

}