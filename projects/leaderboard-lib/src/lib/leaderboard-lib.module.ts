import { NgModule } from '@angular/core';
import { TABLE_CONFIG, TableConfig } from './leaderboard-config';

const TABLE_CONFIG_VALUE: TableConfig = {
  columnDefs: [
    { field: 'medals_count', columnName: 'Medals' },
    { field: 'badges_count', columnName: 'Badges' },
    { field: 'generation_count', columnName: 'Generation Contributions' },
    { field: 'invalidation_count', columnName: 'Invalidation Contributions' },
    { field: 'revision_count', columnName: 'Revision Contributions' },
    { field: 'total_count', columnName: 'Total Score' },
    { field: 'last_contribution', columnName: 'Last Contribution Date' }
  ]
};

@NgModule({
  declarations: [
  ],
  imports: [
  ],
  exports: [
  ],
  providers: [
    { provide: TABLE_CONFIG, useValue: TABLE_CONFIG_VALUE }
  ],
})
export class LeaderboardLibModule { }
