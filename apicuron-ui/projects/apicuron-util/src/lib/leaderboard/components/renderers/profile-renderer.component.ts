import { Component, Input } from "@angular/core";
import { User } from "../../../../../../../src/app/models/User.model";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, AngularSvgIconModule],
  selector: "[profile-renderer]",
  template: `
    <div
      *ngIf="!!user; else unregistered_user"
      class="tw-flex tw-flex-row tw-gap-1 md:tw-ml-2 tw-items-center"
    >
      <div
        class="tw-overflow-hidden tw-w-12 tw-h-12 tw-rounded-full tw-border-2 tw-border-apicuron-bright-purple"
      >
        <img [src]="user.avatar" class="tw-w-full" alt="" />
      </div>
      <a
        class="tw-text-lg tw-block hover:tw-underline tw-whitespace-pre"
        [routerLink]="['/curators', user.orcid_id]"
      >
        <span>{{ user.displayedName }}</span>
      </a>
      <a
        [href]="user.orcid_url"
        class="tw-block tw-w-6 tw-h-6 tw-ml-1 md:tw-ml-2"
      >
        <img
          src="https://orcid.org/assets/vectors/orcid.logo.icon.svg"
          class="tw-w-6 tw-h-6"
          alt=""
        />
      </a>
    </div>

    <ng-template #unregistered_user>
      <div class="tw-flex tw-flex-row tw-gap-1 md:tw-ml-2 tw-items-center">
        <div
          class="tw-overflow-hidden tw-w-12 tw-h-12 tw-rounded-full tw-border-2 tw-border-apicuron-bright-purple"
        >
          <svg-icon
            src="assets/user.svg"
            svgClass="tw-text-apicuron-purple"
          ></svg-icon>
        </div>
        <a
          class="tw-text-lg tw-block hover:tw-underline tw-whitespace-pre"
          href="#"
        >
          <span>Unregistered User</span>
        </a>
        <!-- <a href="#" class="tw-block tw-w-6 tw-h-6 tw-ml-1 md:tw-ml-2">
          <img
            src="https://orcid.org/assets/vectors/orcid.logo.icon.svg"
            class="tw-w-6 tw-h-6"
          />
        </a> -->
      </div>
    </ng-template>
  `,
})
export class ProfileRendererComponent {
  @Input("profile-renderer-user") user: User | null;
}
