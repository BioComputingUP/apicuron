import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { LeaderboardService } from 'src/app/databases/services/leaderboard.service';
import { ResourcesService } from 'src/app/resource/service/resources.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { Resource } from 'src/app/models/resource.model';
import { BaseCuratorStatistics, WeeklyCuratorStatistics } from 'src/app/models/statistics.model';
import { User } from 'src/app/models/User.model';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { CuratorWithStats } from 'src/app/curator-statistics/models/curator-stats';
import { StatisticsFilter } from 'src/app/curator-statistics/models/statistics-filter';
import { Paginated } from 'src/app/interfaces/paginated';
import { WeeklyBarChartComponent } from '../weekly-bar-chart/weekly-bar-chart.component';
import { CuratorStatisticsService } from 'src/app/curator-statistics/services/curator-statistics.service';

@Component({
  standalone: true,
  selector: 'weekly-leaderboard',
  templateUrl: './weekly-leaderboard.component.html',
  imports: [CommonModule, LeaderboardComponent, WeeklyBarChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyLeaderboardComponent implements OnInit, OnDestroy {
  resource_id$: Observable<string>;
  resource$: Observable<Resource>;

  weeklyLeaderboard$: Observable<{ user: User; stat: WeeklyCuratorStatistics }[]>;
  paginatedWeeklyLeaderboard$: Observable<{ user: User; stat: WeeklyCuratorStatistics }[]>;
  weeklyContributors$: Observable<number>;

  statFilter$: Observable<StatisticsFilter>;
  stats$: Observable<Paginated<CuratorWithStats>>;
  statsWithUsers$: Observable<{ stat: BaseCuratorStatistics; user: User }[]>;
  statsList$: Observable<CuratorWithStats[]>;
  statsMeta$: Observable<{ pagination: { total: number; start: number; limit: number }; }>;
  maxPage$: Observable<number>;

  destroy$ = new Subject();
  page$ = new BehaviorSubject<number>(1);
  limit = 10;

  tableColumnsWeekly: string[] = [
    'generation_count',
    'invalidation_count',
    'revision_count',
    'total_score',
    'daysOfWeek',
  ];

  constructor(
    protected resourceService: ResourcesService,
    protected leaderboardService: LeaderboardService,
    protected route: ActivatedRoute,
    protected statService: CuratorStatisticsService,
  ) {}

  ngOnInit(): void {
    this.resource_id$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('resource_id'))
    );

    this.resource$ = this.resource_id$.pipe(
      switchMap(resource_id => this.resourceService.get_resource(resource_id).pipe(shareReplay()))
    );

    this.weeklyLeaderboard$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => 
        this.leaderboardService.getWeeklyResourceLeaderboardWithUsers(resource_id)
      ),
      shareReplay()
    );

    this.paginatedWeeklyLeaderboard$ = combineLatest([this.weeklyLeaderboard$, this.page$]).pipe(
      map(([weeklyLeaderboard, page]) => {
        const start = (page - 1) * this.limit;
        const end = start + this.limit;
        return weeklyLeaderboard.slice(start, end);
      }),
      shareReplay()
    );

    this.weeklyContributors$ = this.weeklyLeaderboard$.pipe(
      map(weeklyLeaderboard => weeklyLeaderboard.length),
      startWith(0)
    );

    this.maxPage$ = this.weeklyLeaderboard$.pipe(
      map(weeklyLeaderboard => Math.ceil(weeklyLeaderboard.length / this.limit)),
      startWith(1)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
  
  nextPage() {
    this.page$.next(this.page$.value + 1);
  }

  prevPage() {
    if (this.page$.value - 1 > 0) {
      this.page$.next(this.page$.value - 1);
    }
  }
}