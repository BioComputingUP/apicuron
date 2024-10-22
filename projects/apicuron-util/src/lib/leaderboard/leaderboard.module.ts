import { NgModule } from "@angular/core";
import { ResourceLeaderboardComponent } from "./resource-leaderboard.component";
import { DatabasesService } from "../../../../../src/app/databases/services/databases.service";
import { ResourceLeaderboardService } from "./services/resource-leaderboard.service";
import { AsyncPipe, CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { ProfileRendererComponent } from "./components/renderers/profile-renderer.component";
import { PaginationComponent } from "../pagination/pagination.component";
import { LoadableComponent } from "../loadable";
import { TotalLeaderboardComponent } from "./leaderboards/total-leaderboard/total-leaderboard.component";
import { WeeklyLeaderboardComponent } from "./leaderboards/weekly-leaderboard/weekly-leaderboard.component";
import { ResourceModule } from "../resource";
import { MonthlyLeaderboardComponent } from "./leaderboards/monthly-leaderboard";

@NgModule({
  declarations: [ResourceLeaderboardComponent],
  providers: [DatabasesService, ResourceLeaderboardService, AsyncPipe],
  imports: [
    CommonModule,
    ResourceModule,
    MonthlyLeaderboardComponent,
    TotalLeaderboardComponent,
    WeeklyLeaderboardComponent,
    PaginationComponent,
    AngularSvgIconModule,
    ProfileRendererComponent,
    LoadableComponent,
  ],
  exports: [ResourceLeaderboardComponent],
})
export class LeaderboardModule {}
