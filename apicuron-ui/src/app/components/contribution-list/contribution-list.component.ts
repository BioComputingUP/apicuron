import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Report } from "src/app/models/report.model";
import { Term } from "src/app/models/term.model";

export interface ContributionRow {
  activity: string;
  description: string; // term description for hover
  url: string; // entity url
  displayUrl: string; // url without protocol
  date: Date;
}

/** A row per report, named after the resource's term when there is one. */
export function toContributionRow(report: Report, terms: Term[]): ContributionRow {
  const term = terms.find((t) => t.activity_term == report.activity_term);
  const url = report.entity_uri ?? "";
  return {
    activity: term?.activity_name || report.activity_term,
    description: term?.description ?? "",
    url,
    displayUrl: url.replace(/^[a-z][a-z0-9+.-]*:\/\/(www\.)?/i, ""),
    date: report.timestamp,
  };
}

/**
 * Table of contributions: activity, entry, date. Every other row is tinted
 * with a light shade of the resource colour.
 */
@Component({
  selector: "contribution-list",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table
      *ngIf="rows.length > 0; else empty"
      class="tw-w-full tw-table-fixed tw-text-sm"
    >
      <thead>
        <tr
          class="tw-border-b tw-border-slate-200 tw-text-left tw-text-xs tw-text-slate-500"
        >
          <th class="tw-w-[38%] tw-py-1.5 tw-pl-2 tw-pr-3 tw-font-medium">
            Activity
          </th>
          <th class="tw-py-1.5 tw-pr-3 tw-font-medium">Entry</th>
          <th class="tw-w-24 tw-py-1.5 tw-pr-2 tw-text-right tw-font-medium">
            Date
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          *ngFor="let row of rows; let odd = odd"
          [style.background-color]="odd ? stripe : null"
        >
          <td
            class="tw-py-2 tw-pl-2 tw-pr-3 tw-align-top tw-text-gray-800"
            [title]="row.description"
          >
            <span class="tw-block tw-truncate">{{ row.activity }}</span>
          </td>
          <td class="tw-py-2 tw-pr-3 tw-align-top">
            <a
              *ngIf="row.url; else noUrl"
              class="tw-block tw-truncate tw-font-mono tw-text-xs tw-leading-5 tw-text-blue-700 hover:tw-underline"
              [href]="row.url"
              [title]="row.url"
              target="_blank"
              rel="noopener noreferrer"
              >{{ row.displayUrl }}</a
            >
            <ng-template #noUrl
              ><span class="tw-text-slate-400">—</span></ng-template
            >
          </td>
          <td
            class="tw-py-2 tw-pr-2 tw-align-top tw-text-right tw-whitespace-nowrap tw-tabular-nums tw-text-slate-500"
          >
            {{ row.date | date: "d MMM y" }}
          </td>
        </tr>
      </tbody>
    </table>
    <ng-template #empty>
      <p class="tw-text-sm tw-text-gray-500">No public contributions yet.</p>
    </ng-template>
  `,
})
export class ContributionListComponent {
  @Input() rows: ContributionRow[] = [];
  /** resource colour; stripes fall back to light gray without one */
  @Input() color?: string | null;

  /** background of every other row: the resource colour mixed down to a light tint */
  get stripe(): string {
    return this.color
      ? `color-mix(in srgb, ${this.color} 7%, transparent)`
      : "rgb(248 250 252)"; // slate-50
  }
}
