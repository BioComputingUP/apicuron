import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { LeaderboardLibComponent } from "../leaderboard-lib.component";
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
import { map, shareReplay, switchMap, tap } from "rxjs/operators";
import { Paginated } from "src/app/interfaces/paginated";
import { CuratorStatisticsService } from "src/app/curator-statistics/services/curator-statistics.service";
import { LeaderboardFilter } from "../interfaces/leaderboard-filter";
import { AngularSvgIconModule } from "angular-svg-icon";
import { environment } from "../../../../../src/environments/environment";
import { LeaderboardEntry } from "../interfaces/leaderboard-entry";
@Component({
  standalone: true,
  selector: "total-leaderboard",
  templateUrl: "./total-leaderboard.component.html",
  imports: [CommonModule, LeaderboardLibComponent, AngularSvgIconModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalLeaderboardComponent implements OnInit, OnDestroy {
  resource$ = new ReplaySubject<Resource>(1);

  @Input("resource") set resource(value: Resource) {
    console.log("Resource Set", value);
    this.resource$.next(value);
  }

  apicuronURL= environment.host;
  totalLeaderboard$: Observable<Paginated<LeaderboardEntry>>;
  totalContributors$: Observable<number>;
  leaderboardFilter$: Observable<LeaderboardFilter>;
  maxPage$: Observable<number>;

  destroy$ = new Subject();
  page$ = new BehaviorSubject<number>(1);
  limit = 10;

  tableColumnsTotal: string[] = [
    "medals_count",
    "badges_count",
    "generation_count",
    "invalidation_count",
    "revision_count",
    "total_score",
    "last_contribution",
  ];

  constructor(
    protected resourceService: ResourcesService,
    protected leaderboardService: LeaderboardService,
    protected route: ActivatedRoute,
    protected statService: CuratorStatisticsService
  ) {}

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

    this.totalLeaderboard$ = this.leaderboardFilter$.pipe(
      switchMap((filter: LeaderboardFilter) =>
        this.leaderboardService.getResourceLeaderboard(filter)
      ),
      shareReplay(1)
    );

    this.totalContributors$ = this.totalLeaderboard$.pipe(
      map((totalLeaderboard) => totalLeaderboard.meta.pagination.total)
    );

    this.maxPage$ = this.totalLeaderboard$.pipe(
      map((totalLeaderboard) =>
        Math.ceil(totalLeaderboard.meta.pagination.total / this.limit)
      ),
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
