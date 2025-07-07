import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { BipScholarStatsViewModel } from "src/app/models/external/bip-scholar.model";
import { User } from "src/app/models/User.model";
import { BipScholarCardComponent } from "./bip-scholar-card/bip-scholar-card.component";

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BipScoresTooltipManager {
  // This service manages the active tooltip state across different sections for the Bip Scholar component.
  private activeTooltipSubject = new BehaviorSubject<string | null>(null);
  activeTooltip$ = this.activeTooltipSubject.asObservable();

  setActiveTooltip(tooltipId: string | null): void {
    this.activeTooltipSubject.next(tooltipId);
  }

  clearTooltip(): void {
    this.activeTooltipSubject.next(null);
  }
}
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
