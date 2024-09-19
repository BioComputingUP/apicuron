import { Component, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Resource } from 'src/app/models/resource.model';

@Component({
  standalone: true,
  selector: 'lib-leaderboard-lib',
  template: `<p>leaderboard-lib works!</p>`,
  styles: [
  ]
})
export class LeaderboardLibComponent {
  displayedColumns: string[] = ['medals_count', 'badges_count', 'generation_count', 'invalidation_count', 'revision_count', 'total_count']

  resource$: ReplaySubject<Resource> = new ReplaySubject<Resource>(1);
  @Input("resource") set resource(value: Resource) {
    this.resource$.next(value);
  }
}