import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, shareReplay, switchMap } from "rxjs/operators";
import { AchievementFilter } from "src/app/achievements/interfaces/achievement-filter";
import { BadgesService } from "src/app/achievements/services/badges.service";
import { BadgeCardComponent } from "src/app/components/badge-card/badge-card.component";
import { Paginated } from "src/app/interfaces/paginated";
import { User } from "src/app/models/User.model";
import { Badge } from "src/app/models/badge.model";
import { Resource } from "src/app/models/resource.model";
import { PaginationComponent } from "src/app/pagination/pagination.component";
import { TermsModule } from "../../terms/terms.module";
import { TermsService } from "../../terms/services/terms.service";
import { TermsFilter } from "../../terms/models/terms-filter";
import { Term } from "../../models/term.model";


@Component({
    standalone: true,
    selector: 'curator-badges-details',
    imports: [CommonModule, TermsModule, BadgeCardComponent, PaginationComponent],
    templateUrl: './curator-badges-details.component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class CuratorBadgesDetailsComponent implements OnInit {

    @Input() curator: User;
    @Input() resource: Resource;
    badges$: Observable<Paginated<Badge>>;
    terms$: Observable<Term[]>;

    get currentPage (){
        const val = this.badgeFilter$.value
        return (val.skip / val.limit) + 1; 
    }

    set currentPage(value) {
        this.update_page(value)
    }

    update_page(page) {
        const filter = this.badgeFilter$.value
        filter.skip = (page - 1) * filter.limit
        this.badgeFilter$.next(filter)
    }

    badgeFilter$: BehaviorSubject<AchievementFilter> = new BehaviorSubject(null);

    constructor(protected badgeService: BadgesService, protected termService: TermsService) {}

    

    loadTerms(){
        const termFilter = new TermsFilter()
        termFilter.resource_id = this.resource.resource_id
        return this.termService.getTerms(termFilter).pipe(
            shareReplay(1)
        )
    }

    ngOnInit(): void {
        const badgeFilter = AchievementFilter.create({
            resource_id: this.resource.resource_id,
            curator_orcid: this.curator.orcid_id,
            limit: 16,
            skip: 0
        })
        this.badgeFilter$.next(badgeFilter)

        this.badges$ = this.badgeFilter$.pipe(
            filter((filter) => !!filter),
            switchMap((badgeFilter: AchievementFilter) => {
                return this.badgeService.getBadges(badgeFilter)
            }),
            shareReplay(1)
        )

        this.terms$ = this.loadTerms()
    }
}