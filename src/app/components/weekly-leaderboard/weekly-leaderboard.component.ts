import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { LeaderboardComponent } from "../leaderboard/leaderboard.component";
import { LeaderboardService } from "src/app/databases/services/leaderboard.service";
import { ResourcesService } from "src/app/resource/service/resources.service";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
} from "rxjs";
import { Resource } from "src/app/models/resource.model";
import { User } from "src/app/models/User.model";
import { map, shareReplay, startWith, switchMap } from "rxjs/operators";
import { CuratorWithStats } from "src/app/curator-statistics/models/curator-stats";
import { StatisticsFilter } from "src/app/curator-statistics/models/statistics-filter";
import { Paginated } from "src/app/interfaces/paginated";
import { WeeklyBarChartComponent } from "../weekly-bar-chart/weekly-bar-chart.component";
import { CuratorStatisticsService } from "src/app/curator-statistics/services/curator-statistics.service";
import { LeaderboardFilter } from "../../databases/interfaces/leaderboard-filter";
import { WeeklyLeaderboardEntry } from "../../databases/interfaces/leaderboard-entry";

@Component({
  standalone: true,
  selector: "weekly-leaderboard",
  templateUrl: "./weekly-leaderboard.component.html",
  imports: [CommonModule, LeaderboardComponent, WeeklyBarChartComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyLeaderboardComponent implements OnInit, OnDestroy {
  resource$ = new ReplaySubject<Resource>(1);
  weeklyContributors$: Observable<number>;
  maxPage$: Observable<number>;

  destroy$ = new Subject();
  page$ = new BehaviorSubject<number>(1);
  limit = 10;
  leaderboardFilter$: Observable<LeaderboardFilter>;
  weeklyLeaderboard$: Observable<Paginated<WeeklyLeaderboardEntry>>;

  tableColumnsWeekly: string[] = [
    "generation_count",
    "invalidation_count",
    "revision_count",
    "total_score",
  ];

  constructor(
    protected resourceService: ResourcesService,
    protected leaderboardService: LeaderboardService,
    protected route: ActivatedRoute,
    protected statService: CuratorStatisticsService
  ) {}

  @Input("resource") set resource(value: Resource) {
    this.resource$.next(value);
  }

  ngOnInit(): void {
    this.leaderboardFilter$ = combineLatest([this.resource$, this.page$]).pipe(
      map(([resource, page]: [Resource, number]) => {
        return new LeaderboardFilter(
          resource.resource_id,
          (page - 1) * this.limit,
          this.limit
        );
      })
    );

    this.weeklyLeaderboard$ = this.leaderboardFilter$.pipe(
      switchMap((filter: LeaderboardFilter) =>
        this.leaderboardService.getWeeklyResourceLeaderboard(filter)
      ),
      shareReplay(1)
    );

    this.weeklyContributors$ = this.weeklyLeaderboard$.pipe(
      map((weeklyLeaderboard) => weeklyLeaderboard.meta.pagination.total)
    );

    this.maxPage$ = this.weeklyLeaderboard$.pipe(
      map((weeklyLeaderboard) =>
        Math.ceil(weeklyLeaderboard.meta.pagination.total / this.limit)
      )
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
