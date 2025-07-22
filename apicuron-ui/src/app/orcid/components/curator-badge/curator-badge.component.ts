import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { OrcidProfile } from "../../../models/orcid-profile.model";

@Component({
  selector: "curator-badge",
  templateUrl: "./curator-badge.component.html",
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuratorBadge {
  @Input() curator: OrcidProfile;

  @Input() isRemovable: boolean = false;

  @Output() remove: EventEmitter<OrcidProfile> =
    new EventEmitter<OrcidProfile>();

  removeCurator() {
    this.remove.emit(this.curator);
  }
}
