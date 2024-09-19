import { Component, Input } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Resource } from 'src/app/models/resource.model';
import { TableDateDirective } from './table-date/table-date.directive';
import { TableScoreDirective } from './table-score/table-score.directive';
import { TableStringDirective } from './table-string/table-string.directive';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { LeaderboardEntry } from 'projects/leaderboard-lib/src/lib/interfaces/leaderboard-entry';

@Component({
  standalone: true,
  selector: 'lib-leaderboard-lib',
  templateUrl: "../lib/leaderboard-lib.component.html",
  imports: [CommonModule, CdkTableModule, TableDateDirective, TableScoreDirective, TableStringDirective],
  hostDirectives: [
    { 
      directive: TableDateDirective,
      inputs: [],
    }, 
    { 
      directive: TableScoreDirective,
      // inputs: ['medals_count', 'badges_count', 'generation_count', 'invalidation_count', 'revision_count', 'total_count'],
    }, 
    { 
      directive: TableStringDirective,
      inputs: [],
    },
  ],
  styles: []
})
export class LeaderboardLibComponent {
  displayedColumns: string[] = ['medals_count', 'badges_count', 'generation_count', 'invalidation_count', 'revision_count', 'total_count']

  statsList$: Observable<LeaderboardEntry[]>;
  resource$: ReplaySubject<Resource> = new ReplaySubject<Resource>(1);
  @Input("resource") set resource(value: Resource) {
    this.resource$.next(value);
  }
}