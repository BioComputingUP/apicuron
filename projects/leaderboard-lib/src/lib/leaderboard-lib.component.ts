import { Component, Injector, Input } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Resource } from 'src/app/models/resource.model';
import { TableDateComponent } from './table-date/table-date.component';

import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { LeaderboardEntry } from 'projects/leaderboard-lib/src/lib/interfaces/leaderboard-entry';

@Component({
  standalone: true,
  selector: 'lib-leaderboard-lib',
  templateUrl: "../lib/leaderboard-lib.component.html",
  imports: [CommonModule, CdkTableModule, TableDateComponent],
  styles: []
})
export class LeaderboardLibComponent {
  displayedColumns: string[] = ['medals_count', 'badges_count', 'generation_count', 'invalidation_count', 'revision_count', 'total_count']

  statsList$: Observable<LeaderboardEntry[]>;
  resource$: ReplaySubject<Resource> = new ReplaySubject<Resource>(1);
  @Input("resource") set resource(value: Resource) {
    this.resource$.next(value);
  }


  data = [
    {
      today: new Date()
    }
  ]

  injectorFactory = (data: any, field: string) => {
    return Injector.create([
      {
        provide: 'CELL_TOKEN',
        useValue: data[field]
      },
      {
        provide: 'ROW_TOKEN',
        useValue: data
      }
    ])
  }


  table = [
    {
      cellComponent: TableDateComponent,
      field: 'today',
      columnName: 'Today\'s date',
    }
  ]

  columns =['today']


}