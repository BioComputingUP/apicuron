import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ResourceModule } from "../resource/resource.module";
import { DatabasesPageComponent } from "./databases-page/databases-page.component";
import { DatabasesRoutingModule } from "./databases-routing.module";
import { DatabasePageComponent } from "./database-page/database-page.component";
import { CuratorModule } from "../curator/curator.module";
import { DatabaseCreateComponent } from "./database-create/database-create.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthModule } from "../auth/auth.module";
import { DatabasesService } from "./services/databases.service";
import { TermCardComponent } from "../components/term-card/term-card.component";
import { BadgeDefCardComponent } from "../components/badge-def-card/badge-def-card.component";
import { MedalDefCardComponent } from "../components/medal-def-card/medal-def-card.component";
import { AchievementsDefModule } from "../achievements-def/achievements-def.module";
import { TermsModule } from "../terms/terms.module";
import { LeaderboardComponent } from "../../../projects/leaderboard-lib/src/lib/leaderboard/leaderboard.component";
import { TotalLeaderboardComponent } from "../../../projects/leaderboard-lib/src/lib/total-leaderboard/total-leaderboard.component";
import { WeeklyLeaderboardComponent } from "../../../projects/leaderboard-lib/src/lib/weekly-leaderboard/weekly-leaderboard.component";
import { CdkAccordionModule } from "@angular/cdk/accordion";
import { LeaderboardLibComponent } from "projects/leaderboard-lib/src/public-api";
@NgModule({
  declarations: [
    DatabasesPageComponent,
    DatabasePageComponent,
    DatabaseCreateComponent,
  ],
  imports: [
    CommonModule,
    CdkAccordionModule,
    TermCardComponent,
    BadgeDefCardComponent,
    DatabasesRoutingModule,
    AuthModule,
    ResourceModule,
    RouterModule,
    CuratorModule,
    ReactiveFormsModule,
    BadgeDefCardComponent,
    MedalDefCardComponent,
    TermsModule,
    AchievementsDefModule,
    LeaderboardComponent,
    TotalLeaderboardComponent,
    WeeklyLeaderboardComponent,
    LeaderboardLibComponent
],
  providers: [DatabasesService],
  exports: [DatabasesPageComponent],
})
export class DatabasesModule {}
