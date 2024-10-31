import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  combineLatest,
} from "rxjs";
import { Resource } from "src/app/models/resource.model";
import { map, shareReplay, switchMap } from "rxjs/operators";
import { Paginated } from "src/app/interfaces/paginated";
import { environment } from "../../../../../../../src/environments/environment";
import {
  LeaderboardFilter,
  WeeklyLeaderboardEntry,
} from "./weekly-leaderboard.entry";
import { AngularSvgIconModule } from "angular-svg-icon";
import { PaginationComponent } from "../../../pagination/pagination.component";
import { LoadableComponent } from "../../../loadable";
import {
  ColumnManagerService,
  LeaderboardDefToken,
} from "../../services/column-manager.service";
import { leaderboardDef } from "./weekly-leaderboard-def";
import { ColumnConfig } from "../../interfaces/leaderboard-def.interface";
import { ProfileRendererComponent } from "../../components/renderers/profile-renderer.component";
import { WeeklyLeaderboardService } from "./weekly-leaderboard.service";
import { ResourceModule, ResourcesService } from "../../../resource";
@Component({
  standalone: true,
  selector: "weekly-leaderboard",
  templateUrl: "./weekly-leaderboard.component.html",
  providers: [
    {
      provide: LeaderboardDefToken,
      useValue: leaderboardDef,
    },
    ColumnManagerService,
    WeeklyLeaderboardService,
  ],
  imports: [
    CommonModule,
    ResourceModule,
    RouterModule,
    PaginationComponent,
    LoadableComponent,
    ProfileRendererComponent,
    AngularSvgIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyLeaderboardComponent implements OnInit {
  resource$ = new ReplaySubject<Resource>(1);
  apicuronURL = environment.host;
  page$ = new BehaviorSubject<number>(1);
  limit = 10;
  leaderboardFilter$: Observable<LeaderboardFilter>;
  weeklyLeaderboard$: Observable<Paginated<WeeklyLeaderboardEntry>>;

  @Input("columns") set columns(value: string[]) {
    this.columnManager.selectedColumns$.next(value);
  }

  columns$: Observable<ColumnConfig<WeeklyLeaderboardEntry>[]>;

  constructor(
    protected resourceService: ResourcesService,
    protected leaderboardService: WeeklyLeaderboardService,
    protected columnManager: ColumnManagerService
  ) {
    this.columns$ = this.columnManager.getColumns(
      this.columnManager.selectedColumns$
    );
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
        this.leaderboardService.getResourceLeaderboard(filter)
      ),
      shareReplay(1)
    );
  }

  @Input("resource") set resource(value: Resource | string) {
    this.resourceService.loadResource(value).subscribe(this.resource$);
  }

  ngOnInit(): void {}

  pageChanged(event: { page: number }) {
    this.page$.next(event.page);
  }
}
