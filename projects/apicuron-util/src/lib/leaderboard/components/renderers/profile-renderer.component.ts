import { Component, Input } from "@angular/core";
import { User } from "../../../../../../../src/app/models/User.model";
import { RouterModule } from "@angular/router";

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: "[profile-renderer]",
  template: ` <div
    class="tw-flex tw-flex-row tw-gap-1 md:tw-ml-2 tw-items-center"
  >
    <div
      class="tw-overflow-hidden tw-w-12 tw-h-12 tw-rounded-full tw-border-2 tw-border-apicuron-bright-purple"
    >
      <img [src]="user.generate_avatar()" class="tw-w-full" alt="" />
    </div>
    <a
      class="tw-text-lg tw-block hover:tw-underline tw-whitespace-pre"
      [routerLink]="['/curators', user.orcid_id]"
    >
      <span>{{ user.displayedName }}</span>
    </a>
    <a
      [href]="user.orcid_url()"
      class="tw-block tw-w-6 tw-h-6 tw-ml-1 md:tw-ml-2"
    >
      <img
        src="https://orcid.org/assets/vectors/orcid.logo.icon.svg"
        class="tw-w-6 tw-h-6"
        alt=""
      />
    </a>
  </div>`,
})
export class ProfileRendererComponent {
  @Input("profile-renderer-user") user: User;
}
