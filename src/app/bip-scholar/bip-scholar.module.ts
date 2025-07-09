import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { BipScoresComponenet } from "./bip-scores.component";
import { BipScholarCardComponent } from "./bip-scholar-card/bip-scholar-card.component";
import { BipScholarService } from "./services/bip-scholar.service";
import { AuthModule } from "../auth/auth.module";

@NgModule({
  declarations: [BipScoresComponenet, BipScholarCardComponent],
  imports: [CommonModule, AuthModule],
  providers: [BipScholarService],
  exports: [BipScoresComponenet],
})
export class BipScholarModule {}
