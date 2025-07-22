import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BadgeDefService } from "./services/badge-def.service";
import { MedalDefService } from "./services/medal-def.service";




@NgModule({
    imports: [HttpClientModule],
    providers: [BadgeDefService, MedalDefService]
})
export class AchievementsDefModule {

}