import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { LeaderboardService } from 'src/app/databases/services/leaderboard.service';
import { ResourcesService } from 'src/app/resource/service/resources.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { Resource } from 'src/app/models/resource.model';
import { User } from 'src/app/models/User.model';
import { BaseCuratorStatistics } from 'src/app/models/statistics.model';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { StatisticsFilter } from 'src/app/curator-statistics/models/statistics-filter';
import { CuratorWithStats } from 'src/app/curator-statistics/models/curator-stats';
import { Paginated } from 'src/app/interfaces/paginated';
import { CuratorStatisticsService } from 'src/app/curator-statistics/services/curator-statistics.service';
@Component({
  standalone: true,
  selector: 'total-leaderboard',
  templateUrl: './total-leaderboard.component.html',
  imports: [CommonModule, LeaderboardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalLeaderboardComponent implements OnInit, OnDestroy {
  resource_id$: Observable<string>;
  resource$: Observable<Resource>;

  totalLeaderboard$: Observable<{ user: User; stat: BaseCuratorStatistics }[]>;
  paginatedTotalLeaderboard$: Observable<{ user: User; stat: BaseCuratorStatistics }[]>;
  totalContributors$: Observable<number>;

  statFilter$: Observable<StatisticsFilter>;
  stats$: Observable<Paginated<CuratorWithStats>>;
  statsWithUsers$: Observable<{ stat: BaseCuratorStatistics; user: User }[]>;
  statsList$: Observable<CuratorWithStats[]>;
  statsMeta$: Observable<{ pagination: { total: number; start: number; limit: number }; }>;
  maxPage$: Observable<number>;

  destroy$ = new Subject();
  page$ = new BehaviorSubject<number>(1);
  limit = 10;

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
    protected statService: CuratorStatisticsService,
  ) { }

  ngOnInit(): void {
    this.resource_id$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('resource_id'))
    );

    this.resource$ = this.resource_id$.pipe(
      switchMap(resource_id => this.resourceService.get_resource(resource_id).pipe(shareReplay()))
    );

    this.totalLeaderboard$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => 
        this.leaderboardService.getResourceLeaderboardWithUsers(resource_id)
      ),
      shareReplay()
    );

    this.paginatedTotalLeaderboard$ = combineLatest([this.totalLeaderboard$, this.page$]).pipe(
      map(([totalLeaderboard, page]) => {
        const start = (page - 1) * this.limit;
        const end = start + this.limit;
        return totalLeaderboard.slice(start, end);
      }),
      shareReplay()
    );

    this.totalContributors$ = this.totalLeaderboard$.pipe(
      map(totalLeaderboard => totalLeaderboard.length),
      startWith(0)
    );
    
    this.maxPage$ = this.totalLeaderboard$.pipe(
      map(totalLeaderboard => Math.ceil(totalLeaderboard.length / this.limit)),
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
