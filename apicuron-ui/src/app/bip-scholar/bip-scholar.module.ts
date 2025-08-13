import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { LoadableComponent } from "../../../projects/apicuron-util/src/lib/loadable";
import { AuthModule } from "../auth/auth.module";
import { BipScholarCardComponent } from "./bip-scholar-card/bip-scholar-card.component";
import { BipScoresComponent } from "./bip-scores.component";
import { BipScholarService } from "./services/bip-scholar.service";

@NgModule({
  declarations: [BipScoresComponent, BipScholarCardComponent],
  imports: [CommonModule, AuthModule, LoadableComponent],
  providers: [BipScholarService],
  exports: [BipScoresComponent],
})
export class BipScholarModule {}
