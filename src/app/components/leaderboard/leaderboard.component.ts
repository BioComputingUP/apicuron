import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { BehaviorSubject, Observable, ReplaySubject, Subject } from "rxjs";
import { map, shareReplay, tap } from "rxjs/operators";
import { CuratorStatisticsModule } from "../../curator-statistics/curator-statistics.module";
import { CuratorStatisticsService } from "../../curator-statistics/services/curator-statistics.service";
import { CuratorModule } from "../../curator/curator.module";
import { CuratorService } from "../../curator/curator.service";
import { Resource } from "../../models/resource.model";
import { ResourcesService } from "../../resource/service/resources.service";
import { AngularSvgIconModule, SvgIconRegistryService } from "angular-svg-icon";
import { ReactiveFormsModule } from "@angular/forms";
import { ResourceModule } from "src/app/resource/resource.module";
import { RouterModule } from "@angular/router";
import { LeaderboardService } from "src/app/databases/services/leaderboard.service";
import { TotalLeaderboardComponent } from "../total-leaderboard/total-leaderboard.component";
import { WeeklyLeaderboardComponent } from "../weekly-leaderboard/weekly-leaderboard.component";
@Component({
  standalone: true,
  selector: "leaderboard",
  imports: [
    CommonModule,
    RouterModule,
    CuratorStatisticsModule,
    ResourceModule,
    CuratorModule,
    AngularSvgIconModule,
    ReactiveFormsModule,
    TotalLeaderboardComponent,
    WeeklyLeaderboardComponent,
  ],
  templateUrl: "./leaderboard.component.html",
  styleUrls: ["./leaderboard.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent implements OnInit {
  resource$: ReplaySubject<Resource> = new ReplaySubject<Resource>(1);
  @Input("resource") set resource (value: Resource) {
    console.log(value);
    this.resource$.next(value);
  }

  leaderboardType$ = new BehaviorSubject<"total" | "weekly">("total");
  isWeekly$: Observable<boolean>;
  isTotal$: Observable<boolean>;

  constructor(
    protected statService: CuratorStatisticsService,
    protected curatorService: CuratorService,
    protected resourceService: ResourcesService,
    protected svgRegistry: SvgIconRegistryService,
    protected leaderboardService: LeaderboardService
  ) {
    // preloading the loading svg icon
    this.svgRegistry.loadSvg("assets/svg/loading-spinner.svg").subscribe();
  }

  ngOnInit(): void {
    this.resource$.pipe(tap(console.log)).subscribe();
    this.isWeekly$ = this.leaderboardType$.pipe(
      map((type: "total" | "weekly") => type === "weekly")
    );
    this.isTotal$ = this.leaderboardType$.pipe(
      map((type: "total" | "weekly") => type === "total")
    );
  }

  showTotalLeaderboard(): void {
    this.leaderboardType$.next("total");
  }

  showWeeklyLeaderboard(): void {
    this.leaderboardType$.next("weekly");
  }
}
