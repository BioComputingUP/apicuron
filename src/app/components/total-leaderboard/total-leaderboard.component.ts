import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User.model';
import { BaseCuratorStatistics } from 'src/app/models/statistics.model';
import { LeaderboardService } from 'src/app/databases/services/leaderboard.service';
import { ResourcesService } from 'src/app/resource/service/resources.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Resource } from 'src/app/models/resource.model';
import { LeaderboardTableComponent } from '../leaderboard-table/leaderboard-table.component';

@Component({
  standalone: true,
  selector: 'total-leaderboard',
  templateUrl: './total-leaderboard.component.html',
  imports: [CommonModule, LeaderboardComponent, LeaderboardTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalLeaderboardComponent implements OnInit {
  resource_id$: Observable<string>;
  resource$: Observable<Resource>;
  totalLeaderboard$: Observable<{ user: User; stat: BaseCuratorStatistics }[]>;

  tableColumnsTotal: string[] = [
    'medals_count',
    'badges_count',
    'generation_count',
    'invalidation_count',
    'revision_count',
    'total_score',
    'last_contribution'
  ];

  constructor(
    protected resourceService: ResourcesService,
    protected leaderboardService: LeaderboardService,
    protected route: ActivatedRoute,
  ) {}
    
  ngOnInit(): void {
    this.resource_id$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("resource_id");
      })
    );

    this.resource$ = this.resource_id$.pipe(
      switchMap(resource_id => 
        this.resourceService.get_resource(resource_id).pipe(
          shareReplay()
        )
      )
    );

    this.totalLeaderboard$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => {
        return this.leaderboardService.getResourceLeaderboardWithUsers(resource_id);
      }),
      shareReplay()
    )
  }
}
