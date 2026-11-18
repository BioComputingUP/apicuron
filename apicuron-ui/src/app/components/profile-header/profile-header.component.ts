import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from "@angular/core";
import { User } from "src/app/models/User.model";
import { SocialLinksComponent } from "../social-links/social-links.component";

/** Max legnth before trunctating" */
const LONG_BIOGRAPHY = 280;
/** how long "Link copied" stays on the share button */
const COPIED_FEEDBACK_MS = 2000;

@Component({
  selector: "profile-header",
  standalone: true,
  imports: [CommonModule, SocialLinksComponent],
  templateUrl: "./profile-header.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileHeaderComponent {
  @Input({ required: true }) user: User;

  biographyExpanded = false;
  shareState: "idle" | "copied" | "failed" = "idle";

  constructor(private changeDetector: ChangeDetectorRef) {}

  get biography(): string {
    return (this.user.biography ?? "").trim();
  }

  get isLongBiography(): boolean {
    return this.biography.length > LONG_BIOGRAPHY;
  }

  get keywords(): string[] {
    const keywords: string[] = this.user.keywords ?? [];
    return keywords.filter((keyword) => !!keyword?.trim());
  }

  toggleBiography() {
    this.biographyExpanded = !this.biographyExpanded;
  }

  /** copies the link to this profile to the clipboard */
  async share() {
    const link = `${window.location.origin}/contributors/${this.user.orcid_id}`;
    try {
      await navigator.clipboard.writeText(link);
      this.shareState = "copied";
    } catch {
      this.shareState = "failed";
    }
    this.changeDetector.markForCheck();
    setTimeout(() => {
      this.shareState = "idle";
      this.changeDetector.markForCheck();
    }, COPIED_FEEDBACK_MS);
  }
}
