import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { shareReplay } from "rxjs/operators";
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
    WeeklyLeaderboardComponent
],
  templateUrl: "./leaderboard.component.html",
  styleUrls: ["./leaderboard.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent implements OnInit {
  @Input("resource-id") resource_id: string;

  showTotal: boolean = true;
  resource$: Observable<Resource>;

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
    this.resource$ = this.resourceService
      .get_resource(this.resource_id)
      .pipe(shareReplay());
  }

  showTotalLeaderboard(): void {
    this.showTotal = true;
  }

  showWeeklyLeaderboard(): void {
    this.showTotal = false;
  }
}
