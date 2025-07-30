import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Observable, ReplaySubject, Subject, takeUntil } from "rxjs";
import { BipScholarStatsViewModel } from "src/app/models/external/bip-scholar.model";

import { Injectable } from "@angular/core";
import { BehaviorSubject, map } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthService } from "../auth/auth.service";
import { BipScholarService } from "./services/bip-scholar.service";

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
  templateUrl: "bip-scores.component.html",
})
export class BipScoresComponent implements OnDestroy, OnInit {
  private destroy$ = new Subject<void>();
  protected bipScores$: Observable<BipScholarStatsViewModel>;
  protected userBipUrl$: Observable<URL>;
  protected isOwnProfile$: Observable<boolean>;

  userOrcid$ = new ReplaySubject<string>(1);

  @Input() set orcidId(value: string) {
    this.userOrcid$.next(value);
  }

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
