import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { LeaderboardService } from 'src/app/databases/services/leaderboard.service';
import { ResourcesService } from 'src/app/resource/service/resources.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LeaderboardTableComponent } from '../leaderboard-table/leaderboard-table.component';
import { BaseLeaderboardComponent } from '../base-leaderboard/base-leaderboard.component';

@Component({
  standalone: true,
  selector: 'total-leaderboard',
  templateUrl: './total-leaderboard.component.html',
  imports: [CommonModule, LeaderboardComponent, LeaderboardTableComponent, BaseLeaderboardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalLeaderboardComponent extends BaseLeaderboardComponent {
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
  ) {
    super(resourceService, leaderboardService, route);
  }
}
