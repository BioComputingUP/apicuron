import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

/**
 * Title line used by every section of the profile page,
 * with an optional action on the right (e.g. "View all").
 */
@Component({
  selector: "section-header",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="tw-flex tw-flex-row tw-items-baseline tw-justify-between tw-gap-2 tw-mb-3"
    >
      <h3
        class="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-slate-500"
      >
        {{ heading }}
        <span
          *ngIf="subheading"
          class="tw-ml-1 tw-normal-case tw-tracking-normal tw-font-normal tw-text-slate-400"
          >{{ subheading }}</span
        >
      </h3>
      <button
        *ngIf="actionLabel"
        type="button"
        class="tw-text-sm tw-text-blue-600 hover:tw-underline tw-whitespace-nowrap"
        (click)="action.emit()"
      >
        {{ actionLabel }}
      </button>
    </div>
  `,
})
export class SectionHeaderComponent {
  @Input() heading: string;
  @Input() subheading?: string;
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}
