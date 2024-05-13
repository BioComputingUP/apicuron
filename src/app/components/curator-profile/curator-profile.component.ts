import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { User } from "../../models/User.model";
import { OrcidService } from "src/app/orcid/services/orcid.service";
import { OrcidModule } from "src/app/orcid/orcid.module";
import { BehaviorSubject, Observable, merge } from "rxjs";
import { OrcidProfileLink } from "src/app/orcid/types/orcid";
import { filter, map, shareReplay, switchMap } from "rxjs/operators";
import { SafeUrl } from "@angular/platform-browser";

@Component({
  standalone: true,
  selector: "curator-profile",
  templateUrl: "./curator-profile.component.html",
  imports: [CommonModule, OrcidModule],
  styleUrls: ["./curator-profile.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuratorProfileComponent implements OnInit {
  profileLinks$: Observable<OrcidProfileLink[]>;
  keywords$: Observable<string[]>;
  biography$: Observable<string>;
  employment$: Observable<string>; // field for the place of work
  // avatarLink$: Observable<SafeUrl | string>; // field for uploading the avatar

  userInfo$: Observable<Boolean>;

  constructor(protected orcidService: OrcidService) {}

  curator$ = new BehaviorSubject<User>(null);

  @Input() set curator(value: User) {
    this.curator$.next(value);
  }

  curatorObs$ = this.curator$.asObservable().pipe(
    filter((curator) => !!curator),
    shareReplay(1)
  );

  ngOnInit(): void {
    // extract orcid_id

    this.biography$ = this.curatorObs$.pipe(
      switchMap((curator: User) =>
        this.orcidService.get_biography(curator.orcid_id)
      )
    );
    this.keywords$ = this.curatorObs$.pipe(
      switchMap((curator: User) =>
        this.orcidService.get_keywords(curator.orcid_id)
      )
    );
    this.profileLinks$ = this.curatorObs$.pipe(
      switchMap((curator: User) =>
        this.orcidService.get_profile_links(curator.orcid_id)
      )
    );
    this.employment$ = this.curatorObs$.pipe(
      switchMap((curator: User) =>
        this.orcidService.get_employment(curator.orcid_id)
      )
    );

    this.userInfo$ = merge(
      this.biography$,
      this.keywords$,
      this.profileLinks$,
      this.employment$,
      4
    ).pipe(map((k) => !!k));
  }
}
