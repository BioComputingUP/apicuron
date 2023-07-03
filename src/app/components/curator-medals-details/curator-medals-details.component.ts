import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map, shareReplay, switchMap } from "rxjs/operators";
import { AchievementsModule } from "src/app/achievements/achievements.module";
import { AchievementFilter } from "src/app/achievements/interfaces/achievement-filter";
import { MedalsService } from "src/app/achievements/services/medals.service";
import { MedalCardComponent } from "src/app/components/medal-card/medal-card.component";
import { Paginated } from "src/app/interfaces/paginated";
import { User } from "src/app/models/User.model";
import { Medal } from "src/app/models/medal.model";
import { Resource } from "src/app/models/resource.model";
import { PaginationComponent } from "src/app/pagination/pagination.component";



@Component({
    standalone: true,
    selector: 'curator-medals-details',
    imports: [CommonModule, AchievementsModule, MedalCardComponent, PaginationComponent],
    templateUrl: './curator-medals-details.component.html',
    styleUrls: []
})
export class CuratorMedalsDetailsComponent implements OnInit {
    medals$: Observable<Paginated<Medal>>;

    get currentPage (){
        return this.medalFilter$.value.page
    }

    update_page(page) {
        const filter = this.medalFilter$.value
        filter.page = page
        this.medalFilter$.next(filter)
    }

    medalFilter$ = new BehaviorSubject(null)

    constructor(protected medalService: MedalsService) {}

    @Input() curator: User;
    @Input() resource: Resource;
    

    

    ngOnInit(): void {
        const medalFilter = AchievementFilter.create({
            resource_id: this.resource.resource_id,
            curator_orcid: this.curator.orcid_id,
            page_size: 16,
            page: 1
        })
        this.medalFilter$.next(medalFilter)

        this.medals$ = this.medalFilter$.pipe(
            filter((filter) => !!filter),
            switchMap((medalFilter: AchievementFilter) => {
                return this.medalService.getMedals(medalFilter)
            }),
            shareReplay(1)
        )
    }

}