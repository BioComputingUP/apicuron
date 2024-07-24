import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LeaderboardService } from 'src/app/databases/services/leaderboard.service';
import { User } from 'src/app/models/User.model';
import { Resource } from 'src/app/models/resource.model';
import { BaseCuratorStatistics, WeeklyCuratorStatistics } from 'src/app/models/statistics.model';
import { ResourcesService } from 'src/app/resource/service/resources.service';
import { AngularSvgIconModule } from "angular-svg-icon";
import { WeeklyBarChartComponent } from "../weekly-bar-chart/weekly-bar-chart.component";
import { RouterModule } from '@angular/router';
@Component({
  standalone: true,
  selector: 'leaderboard-table',
  templateUrl: './leaderboard-table.component.html',
  imports: [
    CommonModule, 
    AngularSvgIconModule,
    RouterModule,
    WeeklyBarChartComponent]
})
export class LeaderboardTableComponent implements OnInit {
  @Input() leaderboard$: Observable<{ user: User; stat: BaseCuratorStatistics | WeeklyCuratorStatistics }[]>;
  @Input() tableColumns: string[] = [];
  @Input() isWeekly: boolean = false;
  @Input() resource$: Observable<Resource>;

  constructor(
    protected leaderboardService: LeaderboardService,
    protected resourceService: ResourcesService,
  ) {}

  ngOnInit(): void {}
  
}