import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ActivitiesStatistics } from "src/app/curator-statistics/models/curator-stats";

/** One bar: an activity and how many times it was done. */
export interface ActivityBar {
  label: string;
  description: string;
  count: number;
  percent: number;
}

export function toActivityBars(activities: ActivitiesStatistics[]): ActivityBar[] {
  const done = activities
    .filter((activity) => activity.count > 0)
    .sort((a, b) => b.count - a.count);
  const max = done[0]?.count ?? 0;
  return done.map((activity) => ({
    label: (activity.activity_name || activity.activity_term)
      .replace(/\s+/g, " ")
      .trim(),
    description: activity.description ?? "",
    count: activity.count,
    // minimum bar width is at least 2% so that it is visible even for very small counts
    percent: max > 0 ? Math.max(2, (activity.count / max) * 100) : 0, 
  }));
}

@Component({
  selector: "activity-bars",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="tw-flex tw-flex-col tw-gap-2.5 tw-max-w-3xl">
      <li
        *ngFor="let bar of showAll ? bars : bars.slice(0, visible)"
        class="tw-grid tw-grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:tw-grid-cols-[minmax(0,13rem)_1fr_auto] tw-items-center tw-gap-3 tw-text-sm"
        [title]="bar.description"
      >
        <span class="tw-truncate tw-text-gray-700">{{ bar.label }}</span>
        <span class="tw-h-2 tw-rounded-sm tw-bg-slate-100">
          <span
            class="tw-block tw-h-full tw-rounded-sm tw-bg-apicuron-purple"
            [style.width.%]="bar.percent"
            [style.background-color]="color"
          ></span>
        </span>
        <span
          class="tw-text-right tw-tabular-nums tw-text-gray-800 tw-min-w-[3rem]"
          >{{ bar.count | number }}</span
        >
      </li>
    </ul>
    <button
      *ngIf="bars.length > visible"
      type="button"
      class="tw-mt-3 tw-text-sm tw-text-blue-600 hover:tw-underline"
      (click)="showAll = !showAll"
    >
      {{ showAll ? "Show fewer" : "Show all " + bars.length + " activities" }}
    </button>
  `,
})
export class ActivityBarsComponent {
  @Input() bars: ActivityBar[] = [];
  @Input() visible = 6;
  @Input() color?: string | null;

  showAll = false;
}
