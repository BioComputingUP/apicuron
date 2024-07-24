import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { Observable } from 'rxjs';
import { User } from '@sentry/angular-ivy';
import { WeeklyCuratorStatistics } from 'src/app/models/statistics.model';
import { LeaderboardService } from 'src/app/databases/services/leaderboard.service';
import { ResourcesService } from 'src/app/resource/service/resources.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Resource } from 'src/app/models/resource.model';
import { LeaderboardTableComponent } from '../leaderboard-table/leaderboard-table.component';

@Component({
  standalone: true,
  selector: 'weekly-leaderboard',
  templateUrl: './weekly-leaderboard.component.html',
  imports: [CommonModule, LeaderboardComponent, LeaderboardTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyLeaderboardComponent implements OnInit {
  resource_id$: Observable<string>;
  resource$: Observable<Resource>;
  weeklyLeaderboard$: Observable<{ user: User; stat: WeeklyCuratorStatistics }[]>;

  tableColumnsWeekly: string[] = [
    'generation_count',
    'invalidation_count',
    'revision_count',
    'total_score',
    "daysOfWeek",
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
    
    this.weeklyLeaderboard$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => {
        return this.leaderboardService.getWeeklyResourceLeaderboardWithUsers(resource_id);
      }),
      shareReplay()
    )
  }
}
