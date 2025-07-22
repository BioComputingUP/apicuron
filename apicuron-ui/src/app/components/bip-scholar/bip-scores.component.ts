import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { BipScholarStatsViewModel } from "src/app/models/external/bip-scholar.model";
import { User } from "src/app/models/User.model";
import { BipScholarCardComponent } from "./bip-scholar-card/bip-scholar-card.component";

@Component({
  selector: "app-bip-scores-grid",
  standalone: true,
  imports: [CommonModule, BipScholarCardComponent],
  templateUrl: "bip-scores.componenet.html",
})
export class BipScoresComponenet {
  @Input() bipScores$: Observable<BipScholarStatsViewModel>;
  @Input() user$: Observable<User>;
}
