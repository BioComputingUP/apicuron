import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subject, takeUntil } from "rxjs";
import { BipScholarStatsViewModel } from "src/app/models/external/bip-scholar.model";
import { User } from "src/app/models/User.model";
import { BipScholarCardComponent } from "./bip-scholar-card/bip-scholar-card.component";

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { environment } from "src/environments/environment";
import { map } from "rxjs";
import { BipScholarService } from "./services/bip-scholar.service";
import { AuthService } from "../auth/auth.service";

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
  templateUrl: "bip-scores.componenet.html",
})
export class BipScoresComponenet implements OnDestroy, OnInit {
  private destroy$ = new Subject<void>();
  protected bipScores$: Observable<BipScholarStatsViewModel>;
  protected userBipUrl$: Observable<URL>;
  protected isOwnProfile$: Observable<boolean>;

  @Input() userOrcid$: Observable<string>;

  constructor(
    private bipScholarService: BipScholarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.bipScholarService.init(this.userOrcid$);
    this.bipScores$ = this.bipScholarService.getBipScholarScores(
      this.userOrcid$
    );
    this.userBipUrl$ = this.getUserBipUrl();
    this.isOwnProfile$ = this.authService.isOwnProfile(this.userOrcid$);
  }

  getUserBipUrl(): Observable<URL> {
    return this.userOrcid$.pipe(
      map((orcid: string) => {
        return new URL(`/scholar/profile/${orcid}`, environment.bip_url);
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
