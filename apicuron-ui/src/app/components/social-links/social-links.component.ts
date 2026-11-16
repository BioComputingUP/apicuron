import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

export interface SocialLink {
  name: string;
  url: URL | string;
}

/**
 * Row of a person's links (from ORCID): the icon from assets/social-links when
 * there is one for the link name, a generic link icon otherwise.
 */
@Component({
  selector: "social-links",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul
      *ngIf="links?.length"
      class="tw-flex tw-flex-row tw-flex-wrap tw-items-center tw-gap-2"
    >
      <li *ngFor="let link of links">
        <a
          class="tw-flex tw-h-8 tw-w-8 tw-items-center tw-justify-center tw-rounded-md tw-text-slate-500 hover:tw-bg-slate-100 hover:tw-text-slate-800"
          [href]="link.url"
          [title]="link.name"
          [attr.aria-label]="link.name"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            *ngIf="!missingIcons.has(link.name); else genericIcon"
            class="tw-h-5 tw-w-5"
            [src]="iconSrc(link)"
            alt=""
            (error)="missingIcons.add(link.name)"
          />
          <ng-template #genericIcon>
            <svg
              class="tw-h-5 tw-w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </ng-template>
        </a>
      </li>
    </ul>
  `,
})
export class SocialLinksComponent {
  @Input() links: SocialLink[] | null | undefined;

  /** links whose icon is missing, shown with the generic link icon */
  missingIcons = new Set<string>();

  iconSrc(link: SocialLink): string {
    return `assets/social-links/${link.name.toLowerCase()}.svg`;
  }
}
