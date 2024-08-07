import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, shareReplay, map } from 'rxjs/operators';
import { LeaderboardService } from 'src/app/databases/services/leaderboard.service';
import { User } from 'src/app/models/User.model';
import { BaseCuratorStatistics, WeeklyCuratorStatistics } from 'src/app/models/statistics.model';
import { LeaderboardTableComponent } from '../leaderboard-table/leaderboard-table.component';
import { Resource } from 'src/app/models/resource.model';
import { ResourcesService } from 'src/app/resource/service/resources.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TotalLeaderboardComponent } from '../total-leaderboard/total-leaderboard.component';
import { WeeklyLeaderboardComponent } from '../weekly-leaderboard/weekly-leaderboard.component';

@Component({
  standalone: true,
  selector: 'base-leaderboard',
  templateUrl: './base-leaderboard.component.html',
  imports: [LeaderboardTableComponent, TotalLeaderboardComponent, WeeklyLeaderboardComponent],
})
export class BaseLeaderboardComponent implements OnInit {
  resource_id$: Observable<string>;
  resource$: Observable<Resource>;
  leaderboard$: Observable<{ user: User; stat: BaseCuratorStatistics | WeeklyCuratorStatistics }[]>;
  
  @Input() tableColumns: string[];
  @Input() isWeekly: boolean;

  constructor(
    protected resourceService: ResourcesService,
    protected leaderboardService: LeaderboardService,
    protected route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.resource_id$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('resource_id'))
    );

    this.resource$ = this.resource_id$.pipe(
      switchMap(resource_id => this.resourceService.get_resource(resource_id).pipe(shareReplay()))
    );

    this.leaderboard$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => {
        return this.isWeekly 
          ? this.leaderboardService.getWeeklyResourceLeaderboardWithUsers(resource_id)
          : this.leaderboardService.getResourceLeaderboardWithUsers(resource_id);
      }),
      shareReplay()
    );
  }
}