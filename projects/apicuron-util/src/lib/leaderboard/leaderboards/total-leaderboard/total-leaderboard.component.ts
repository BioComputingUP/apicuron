import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
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
import { LeaderboardEntry } from "./leaderboard-entry";
import { LeaderboardFilter } from "./leaderboard-entry";
import { ResourceLeaderboardService } from "../../services/resource-leaderboard.service";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { PaginationComponent } from "../../../pagination/pagination.component";
import { ProfileRendererComponent } from "../../components/renderers/profile-renderer.component";
import { LoadableComponent } from "../../../loadable";
import { ColumnConfig } from "../../interfaces/leaderboard-def.interface";
import { totalLeaderboardDef } from "./leaderboard-def";
import { loadResource } from "../../util";
import {
  ColumnManagerService,
  LeaderboardDefToken,
} from "../../services/column-manager.service";
import { TotalLeaderboardService } from "./total-leaderboard.service";
import { ResourceModule, ResourcesService } from "../../../resource";
@Component({
  standalone: true,
  imports: [
    CommonModule,
    ResourceModule,
    LoadableComponent,
    PaginationComponent,
    AngularSvgIconModule,
    ProfileRendererComponent,
  ],
  providers: [
    { provide: LeaderboardDefToken, useValue: totalLeaderboardDef },
    ColumnManagerService,
    TotalLeaderboardService,
  ],
  selector: "total-leaderboard",
  templateUrl: "./total-leaderboard.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalLeaderboardComponent implements OnInit {
  resource$ = new ReplaySubject<Resource>();
  columns$: Observable<ColumnConfig[]>;

  @Input("resource") set resource(value: Resource | string) {
    this.resourceService.loadResource(value).subscribe(this.resource$);
  }

  @Input("columns") set columns(value: string[]) {
    this.columnManager.selectedColumns$.next(value);
  }

  totalLeaderboard$: Observable<Paginated<LeaderboardEntry>>;
  leaderboardFilter$: Observable<LeaderboardFilter>;

  page$ = new BehaviorSubject<number>(1);
  limit = 10;
  apicuronURL = environment.host;

  constructor(
    protected totalLeaderboardService: TotalLeaderboardService,
    protected resourceService: ResourcesService,
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
      }),
    );

    this.totalLeaderboard$ = this.leaderboardFilter$.pipe(
      switchMap((filter: LeaderboardFilter) =>
        this.totalLeaderboardService.getResourceLeaderboard(filter)
      ),
      shareReplay(1)
    );
  }
  updatePage(event: { page: number }) {
    this.page$.next(event.page);
  }

  ngOnInit(): void {}
}
