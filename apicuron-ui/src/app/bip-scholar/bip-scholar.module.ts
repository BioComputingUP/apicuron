import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { BipScholarService } from "./services/bip-scholar.service";
import { AuthModule } from "../auth/auth.module";
import { BipScoresComponent } from "./bip-scores.component";
import { BipScholarCardComponent } from "./bip-scholar-card/bip-scholar-card.component";
import { LoadableComponent } from "projects/apicuron-util/src/lib/loadable";

@NgModule({
  declarations: [BipScoresComponent, BipScholarCardComponent],
  imports: [CommonModule, AuthModule, LoadableComponent],
  providers: [BipScholarService],
  exports: [BipScoresComponent],
})
export class BipScholarModule {}
