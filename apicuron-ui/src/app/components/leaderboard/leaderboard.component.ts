import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject, combineLatest, of } from "rxjs";
import { filter, map, pluck, share, shareReplay, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { CuratorStatisticsModule } from "../../curator-statistics/curator-statistics.module";
import { CuratorStatisticsService } from "../../curator-statistics/services/curator-statistics.service";
import { CuratorModule } from "../../curator/curator.module";
import { CuratorService } from "../../curator/curator.service";
import { User } from "../../models/User.model";
import { Resource } from "../../models/resource.model";
import { CuratorStatistics } from "../../models/statistics.model";
import { ResourcesService } from "../../resource/service/resources.service";
import { environment } from "src/environments/environment";
import { AngularSvgIconModule } from "angular-svg-icon";
import { Paginated } from "../../interfaces/paginated";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ResourceModule } from "src/app/resource/resource.module";

const leaderboardColumns = {
    'medals_count': {
        name: 'Medals'
    },
    'badges_count': {
        name: 'Badges'
    },
    'generation_count': {
        name: 'Generation Contributions'
    },
    'invalidation_count': {
        name: 'Invalidation Contributions'
    },
    'revision_count': {
        name: 'Revision Contributions'
    },
    'generation_score': {
        name: 'Generation Score'

    },
    'invalidation_score': {
        name: 'Invalidation Score'

    },
    'revision_score': {
        name: 'Revision Score'
    },
    'total_score': {
        name: 'Total Score'
    },
    'total_count': {
        name: 'Total Contributions'
    }
}

export type LeaderboardQuery = { skip: number, limit: number, resource_id: string }


@Component({
    standalone: true,
    selector: 'leaderboard',
    imports: [CommonModule, CuratorStatisticsModule, ResourceModule, CuratorModule, AngularSvgIconModule, ReactiveFormsModule],
    templateUrl: './leaderboard.component.html',
    styleUrls: [
        './leaderboard.component.scss'
    ]
})
export class LeaderboardComponent implements OnInit, OnDestroy {

    statsList$: Observable<CuratorStatistics[]>;
    statsWithUsers$: Observable<{ stat: CuratorStatistics; user: User; }[]>;
    resource$: Observable<Resource>;

    tableColumns: string[] = ['medals_count', 'badges_count', 'generation_count', 'invalidation_count', 'revision_count', 'total_score'];


    apicuronURL = environment.host;
    stats$: Observable<Paginated<CuratorStatistics>>;
    statsMeta$: Observable<{ pagination: { total: number; start: number; limit: number; }; }>;

    leaderboardQuery$ = new BehaviorSubject<LeaderboardQuery>({ skip: 0, limit: 10, resource_id: null });

    page: FormControl
    destroy$ = new Subject();

    constructor(protected statService: CuratorStatisticsService, protected curatorService: CuratorService, protected resourceService: ResourcesService) {

        this.stats$ = this.leaderboardQuery$.asObservable().pipe(
            filter((query: LeaderboardQuery) => { return !!query.resource_id }),
            shareReplay(),
            switchMap(({ resource_id, skip, limit }: LeaderboardQuery) => {
                return this.statService.getResourceLeaderboard(resource_id, limit, skip)
            }),
            shareReplay()
        )
        this.statsList$ = this.stats$.pipe(pluck('data'))
        this.statsMeta$ = this.stats$.pipe(pluck('meta'))

        this.page = new FormControl(1)

        this.page.valueChanges.pipe(
            filter((page) => !!page),
            switchMap((page: any) => {
                return combineLatest([
                    of(page),
                    this.statsMeta$.pipe(pluck('pagination'))
                ])
            }),
            // convert to skip, limit
            map(([curr, prev]) => {
                return [
                    {
                        skip: (curr - 1) * this.leaderboardQuery$.value.limit,
                        limit: this.leaderboardQuery$.value.limit
                    },
                    {
                        skip: prev.start - 1,
                        limit: prev.limit,
                        total: prev.total
                    }
                ]
            }),
            tap(console.log),
            filter(([curr, prev]) => curr.skip != prev.skip && curr.limit != prev.limit && curr.limit >= 0),
            tap(() => { console.log('passed filter') }),
            map(([curr, prev]) => {
                const query = this.leaderboardQuery$.value
                this.leaderboardQuery$.next({ ...query, skip: curr.skip, limit: curr.limit })
            }),
            takeUntil(this.destroy$)
        ).subscribe(() => { })

        // combineLatest([this.page.valueChanges, this.statsMeta$.pipe(pluck('pagination'))]).pipe(
        //     // filter(([x, pagination]) => !!x && x != ((pagination.start - 1) / pagination.limit) + 1 && x <= pagination.total / pagination.limit && x >= 1),
        //     filter(([x, pagination]) => !!x && x >= 1),
        //     map(([changes, pagination]: [number, any]) => {
        //         const query = this.leaderboardQuery$.value
        //         this.leaderboardQuery$.next({ ...query, skip: (changes - 1) * query.limit })
        //     }),
        //     takeUntil(this.destroy$)
        // ).subscribe(() => { })
    }
    ngOnDestroy(): void {
        this.destroy$.next(true)
    }

    @Input('resource-id')
    set resource_id(value: string) {
        this.leaderboardQuery$.next({ ...this.leaderboardQuery$.value, resource_id: value });
    }


    @Input('columns')
    set columns(value: string) {
        this.tableColumns = value.split(',').filter((val) => Object.keys(leaderboardColumns).includes(val))
    }


    getColumnProps(col: string) {
        return leaderboardColumns[col]
    }

    ngOnInit(): void {

        this.resource$ = this.leaderboardQuery$.pipe(
            filter((query) => !!query.resource_id),
            switchMap((query) => {
                return this.resourceService.get_resource(query.resource_id)
            }),
            shareReplay()
        )

        this.statsWithUsers$ = this.statsList$.pipe(
            switchMap((stats: CuratorStatistics[]) => {
                const users$List = stats.map(({ curator_orcid }) => this.curatorService.get_curator(curator_orcid).pipe(
                    map((user: any) => new User().deserialize(user))
                ))
                const usersList$ = combineLatest(users$List)
                return combineLatest([usersList$, of(stats)])
            }),
            map(([users, stats]: [User[], CuratorStatistics[]]) => {
                return stats.map((stat) => {
                    return {
                        stat,
                        user: users.find((user) => user.orcid_id == stat.curator_orcid)
                    }
                })
            })

        )

    }


    nextPage() {
        // this.statsMeta$.pipe(

        //     map(({pagination}) => {
        //         const page = this.page.value
        //         if(page <= pagination.total / pagination.limit){
        //         }
        //     }),
        //     take(1)
        // ).subscribe(() => {})
        this.page.setValue(this.page.value + 1)
    }

    prevPage() {
        if (this.page.value - 1 > 0) {
            this.page.setValue(this.page.value - 1)
        }
    }

}