import { Component, Input, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { AchievementState, Badge } from "src/app/models/badge.model";
import { AngularSvgIconModule } from "angular-svg-icon";
import { Term } from "src/app/models/term.model";
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  ReplaySubject,
  Subscription,
  timer,
} from "rxjs";
import { map, tap } from "rxjs/operators";
import moment from "moment";
import { OverlayModule } from "@angular/cdk/overlay";

@Component({
  standalone: true,
  imports: [CommonModule, OverlayModule, AngularSvgIconModule],
  selector: "badge-card",
  templateUrl: "./badge-card.component.html",
})
export class BadgeCardComponent implements OnInit {
  badge$ = new ReplaySubject<Badge>();
  badgeInProgress$: Observable<boolean>;
  AchievementState = AchievementState;
  formattedAchievedAt$: Observable<string>;

  currentProgress = 0;
  progressAnimationInterval: any;

  constructor(private cdRef: ChangeDetectorRef) {
    this.formattedAchievedAt$ = this.formatAchievedAt();
  }

  ngOnInit(): void {
    this.termNames$ = combineLatest([
      this.terms$.asObservable(),
      this.badge$.asObservable(),
    ]).pipe(
      map(([terms, badge]: [Term[], Badge]) => {
        return terms.filter((term: Term) =>
          badge.list_terms.includes(term.activity_term)
        );
      }),
      map((terms: Term[]) => {
        return terms.map((term: Term) => term.activity_name);
      })
    );

    this.badgeInProgress$ = this.badge$
      .asObservable()
      .pipe(map((badge: Badge) => badge.state == AchievementState.progress));
  }

  terms$: ReplaySubject<Term[]> = new ReplaySubject();
  termNames$: Observable<string[]>;

  thresholdDate = moment().subtract(30, "days").toDate();

  @Input()
  enableShadow = true;

  @Input() set badge(value: Badge) {
    this.badge$.next(value);
    this.startProgressAnimation(value.progressRate); // Start the animation when the badge changes
  }

  @Input()
  public set terms(value) {
    if (!!value && value instanceof Array && value.length > 0) {
      this.terms$.next(value);
    }
  }

  private overlayState$ = new BehaviorSubject<boolean>(false);

  overlayOpen$: Observable<boolean> = this.overlayState$.asObservable();
  closeTimeoutSubscription: Subscription | undefined;

  setOverlayState(state: boolean, timeout = 100) {
    if (!state) {
      this.closeTimeoutSubscription = timer(timeout)
        .pipe(tap(() => this.overlayState$.next(state)))
        .subscribe();
      return;
    }
    if (this.closeTimeoutSubscription) {
      this.closeTimeoutSubscription.unsubscribe();
    }
    this.overlayState$.next(state);
  }

  formatBadgeDate(date: Date): string {
    return moment(date).startOf("day").fromNow();
  }

  formatAchievedAt(): Observable<string> {
    return this.badge$.pipe(
      map((badge: Badge) =>
        badge.achieved_at > this.thresholdDate
          ? "The " +
            new DatePipe("UTC").transform(badge.achieved_at, "dd-MM-yyyy") +
            " UTC"
          : this.formatBadgeDate(badge.achieved_at)
      )
    );
  }

  startProgressAnimation(targetProgress: number) {
    this.currentProgress = 0;
    const intervalDuration = 20;
    const increment = 1;

    if (this.progressAnimationInterval) {
      clearInterval(this.progressAnimationInterval);
    }

    this.progressAnimationInterval = setInterval(() => {
      if (this.currentProgress < targetProgress) {
        this.currentProgress += increment;
        this.cdRef.detectChanges();
      } else {
        clearInterval(this.progressAnimationInterval);
      }
    }, intervalDuration);
  }
}
