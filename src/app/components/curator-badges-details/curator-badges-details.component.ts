import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, shareReplay, switchMap } from "rxjs/operators";
import { AchievementFilter } from "src/app/achievements/interfaces/achievement-filter";
import { BadgesService } from "src/app/achievements/services/badges.service";
import { BadgeCardComponent } from "src/app/components/badge-card/badge-card.component";
import { Paginated } from "src/app/interfaces/paginated";
import { User } from "src/app/models/User";
import { Badge } from "src/app/models/badge.model";
import { Resource } from "src/app/models/resource.model";
import { PaginationComponent } from "src/app/pagination/pagination.component";


@Component({
    standalone: true,
    selector: 'curator-badges-details',
    imports: [CommonModule, BadgeCardComponent, PaginationComponent],
    templateUrl: './curator-badges-details.component.html',
    styleUrls: []
})
export class CuratorBadgesDetailsComponent {

    @Input() curator: User;
    @Input() resource: Resource;
    badges$: Observable<Paginated<Badge>>;

    get currentPage (){
        return this.medalFilter$.value.page
    }

    set currentPage(value) {
        this.update_page(value)
    }

    update_page(page) {
        const filter = this.medalFilter$.value
        filter.page = page
        this.medalFilter$.next(filter)
    }

    medalFilter$ = new BehaviorSubject(null)

    constructor(protected badgeService: BadgesService) {}

    

    

    ngOnInit(): void {
        const medalFilter = AchievementFilter.create({
            resource_id: this.resource.resource_id,
            curator_orcid: this.curator.orcid_id,
            page_size: 16,
            page: 1
        })
        this.medalFilter$.next(medalFilter)

        this.badges$ = this.medalFilter$.pipe(
            filter((filter) => !!filter),
            switchMap((medalFilter: AchievementFilter) => {
                return this.badgeService.getBadges(medalFilter)
            }),
            shareReplay(1)
        )
    }

}