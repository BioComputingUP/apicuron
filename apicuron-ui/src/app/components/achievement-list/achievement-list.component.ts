import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { Badge } from "src/app/models/badge.model";
import { Medal } from "src/app/models/medal.model";
import { SectionHeaderComponent } from "../section-header/section-header.component";

/** Medals and badges as two short lists, each with a link to the full list. */
@Component({
  selector: "achievement-list",
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tw-flex tw-flex-col tw-gap-6">
      <section *ngIf="medals.length">
        <section-header
          heading="Medals"
          actionLabel="View all"
          (action)="allMedals.emit()"
        ></section-header>
        <ul class="tw-divide-y tw-divide-slate-100 tw-border-y tw-border-slate-100">
          <li
            *ngFor="let medal of medals"
            class="tw-flex tw-flex-row tw-items-center tw-gap-3 tw-py-2 tw-text-sm"
            [title]="medalTitle(medal)"
          >
            <img src="assets/svg/gold_medal.svg" alt="" class="tw-h-4 tw-w-4 tw-shrink-0" />
            <span class="tw-min-w-0 tw-grow tw-truncate tw-text-gray-800">{{
              medal.name
            }}</span>
            <span class="tw-whitespace-nowrap tw-text-slate-500 tw-tabular-nums">{{
              medal.getRanking()
            }}</span>
          </li>
        </ul>
      </section>

      <section *ngIf="badges.length">
        <section-header
          heading="Badges"
          actionLabel="View all"
          (action)="allBadges.emit()"
        ></section-header>
        <ul class="tw-divide-y tw-divide-slate-100 tw-border-y tw-border-slate-100">
          <li
            *ngFor="let badge of badges"
            class="tw-flex tw-flex-row tw-items-center tw-gap-3 tw-py-2 tw-text-sm"
            [title]="badgeTitle(badge)"
          >
            <img src="assets/svg/badge_check.svg" alt="" class="tw-h-4 tw-w-4 tw-shrink-0" />
            <span class="tw-min-w-0 tw-grow tw-truncate tw-text-gray-800">{{
              badge.displayedName || badge.name
            }}</span>
            <span
              *ngIf="badge.achieved_at"
              class="tw-whitespace-nowrap tw-text-slate-500 tw-tabular-nums"
              >{{ badge.achieved_at | date: "MMM y" }}</span
            >
          </li>
        </ul>
      </section>
    </div>
  `,
})
export class AchievementListComponent {
  @Input() medals: Medal[] = [];
  @Input() badges: Badge[] = [];
  @Output() allMedals = new EventEmitter<void>();
  @Output() allBadges = new EventEmitter<void>();

  medalTitle(medal: Medal): string {
    const among = medal.score_relative > 1 ? ` among ${medal.score_relative}` : "";
    return `${medal.name}: ranked ${medal.getRanking()}${among}`;
  }

  badgeTitle(badge: Badge): string {
    return `${badge.displayedName || badge.name}: ${badge.count_threshold} contributions`;
  }
}
