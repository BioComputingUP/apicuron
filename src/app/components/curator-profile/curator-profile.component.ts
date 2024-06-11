import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { User } from '../../models/User.model' ;
import { OrcidService } from "src/app/orcid/services/orcid.service";
import { OrcidModule } from "src/app/orcid/orcid.module";
import { Observable, merge } from "rxjs";
import { OrcidProfileLink } from "src/app/orcid/types/orcid";
import { map } from "rxjs/operators";
import { NgxPopperModule } from "ngx-popper";

@Component({
    standalone: true,
    selector: 'curator-profile',
    templateUrl: './curator-profile.component.html',
    imports: [CommonModule, OrcidModule, NgxPopperModule],
    styleUrls: ['./curator-profile.component.scss']
})
export class CuratorProfileComponent implements OnInit {
    profileLinks$: Observable<OrcidProfileLink[]>;
    keywords$: Observable<string[]>;
    biography$: Observable<string>;
    employment$: Observable<string>; // field for the place of work
    // avatarLink$: Observable<SafeUrl | string>; // field for uploading the avatar

    userInfo$: Observable<Boolean>;
    
    constructor(protected orcidService: OrcidService) {}

    @Input() curator: User

    ngOnInit(): void {
        // extract orcid_id
        this.biography$ = this.orcidService.get_biography(this.curator.orcid_id)
        this.keywords$ = this.orcidService.get_keywords(this.curator.orcid_id)
        this.profileLinks$ = this.orcidService.get_profile_links(this.curator.orcid_id)
        this.employment$ = this.orcidService.get_employment(this.curator.orcid_id)

        this.userInfo$ = merge(this.biography$, this.keywords$, this.profileLinks$, this.employment$, 4).pipe(
            map((k) => !!k )
        )
    }
}