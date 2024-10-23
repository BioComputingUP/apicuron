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
import { CdkAccordionModule } from "@angular/cdk/accordion";
import { LeaderboardModule } from "../../../projects/apicuron-util/src/lib/leaderboard/leaderboard.module";
import { FairSharingComponent } from "./fairsharing/fairsharing.component";
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
    LeaderboardModule,
    FairSharingComponent
],
  providers:[DatabasesService],
  exports: [DatabasesPageComponent],
})
export class DatabasesModule {}
