import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { DatabasesService } from "../services/databases.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import {
  catchError,
  delay,
  map,
  pluck,
  share,
  shareReplay,
  switchMap,
  tap,
} from "rxjs/operators";
import { combineLatest, interval, Observable } from "rxjs";
import { CuratorService } from "src/app/curator/curator.service";
import { Resource } from "../../models/resource.model";
import { BadgeDefService } from "../../achievements-def/services/badge-def.service";
import { BadgeDefFilter } from "../../achievements-def/interfaces/badge-def.filter";
import { Paginated } from "../../interfaces/paginated";
import { BadgeDef } from "../../models/badge-def.model";
import { TermsService } from "../../terms/services/terms.service";
import { TermsFilter } from "../../terms/models/terms-filter";
import { Term } from "../../models/term.model";
import { MedalDefService } from "../../achievements-def/services/medal-def.service";
import { MedalDefFilter } from "../../achievements-def/interfaces/medal-def.filter";
import { MedalDef } from "../../models/medal-def.model";
import { User } from "../../models/User.model";
@Component({
  selector: "app-database-page",
  templateUrl: "./database-page.component.html",
  styleUrls: ["./database-page.component.scss"],
})
export class DatabasePageComponent implements OnInit, AfterViewInit {
  resourceId$: Observable<string>;
  leaderboard$: Observable<Object>;
  resource$: Observable<Resource>;
  stats$: Observable<unknown>;
  users$: Observable<unknown>;
  leaderboardLoaded$: Observable<Boolean>;
  firstBadges$: Observable<Paginated<BadgeDef>>;
  lastBadges$: Observable<Paginated<BadgeDef>>;
  terms$: Observable<Term[]>;
  firstMedals$: Observable<Paginated<MedalDef>>;
  lastMedals$: Observable<Paginated<MedalDef>>;

  constructor(
    private databaseService: DatabasesService,
    private badgeDefService: BadgeDefService,
    private medalDefService: MedalDefService,
    private termService: TermsService,
    private curatorService: CuratorService,
    private route: ActivatedRoute
  ) {}

  ngAfterViewInit(): void {
    const subscription = interval(1000).pipe(
      delay(500),
      tap((number) => {
        const el: HTMLDivElement = this.mainPanel?.nativeElement;
        const leaderboard: HTMLDivElement =
          this.leaderboardPanel?.nativeElement;
        if (el) {
          const height = el.getBoundingClientRect().height;
          leaderboard.style.height = height + "px";
        }
      })
    );
  }

  more_badges = false;
  more_medals = false;
  expand_terms = false;

  @ViewChild("mainPanel") mainPanel: ElementRef;
  @ViewChild("leaderboardPanel") leaderboardPanel: ElementRef;

  ngOnInit(): void {
    Observable;

    this.resourceId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("resource_id");
      })
    );

    this.stats$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource_leaderboard(resource_id);
      }),
      shareReplay()
    );

    // this.leaderboard$ = this.stats$.pipe(
    //   switchMap(({ data }: any) => {
    //     const users_stats$: Array<Observable<any>> = data.map((stat) => {
    //       return this.curatorService.get_curator(stat.curator_orcid).pipe(
    //         map((curator) => {
    //           return {
    //             curator: new User().deserialize(curator),
    //             stats: [stat],
    //           };
    //         })
    //       );
    //     });
    //     return combineLatest(users_stats$);
    //   }),
    //   shareReplay()
    // );

    // this.leaderboardLoaded$ = this.leaderboard$.pipe(
    //   map((leaderboard: Array<any>): Boolean => {
    //     return !!leaderboard && leaderboard.length > 0;
    //   })
    // );

    this.resource$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource(resource_id);
      }),
      pluck<{ data: Resource }, "data">("data"),
      shareReplay()
    );

    this.firstBadges$ = this.resource$.pipe(
      switchMap(({ resource_id }: Resource) => {
        return this.badgeDefService.getBadgeDefs(
          BadgeDefFilter.create({ resource_id, limit: 8 })
        );
      })
    );

    this.lastBadges$ = this.resource$.pipe(
      switchMap(({ resource_id }: Resource) => {
        return this.badgeDefService.getBadgeDefs(
          BadgeDefFilter.create({ resource_id, skip: 8 })
        );
      }),
      shareReplay()
    );

    this.firstMedals$ = this.resource$.pipe(
      switchMap(({ resource_id }: Resource) => {
        return this.medalDefService.getMedalDefs(
          MedalDefFilter.create({ resource_id, limit: 8 })
        );
      }),
      shareReplay()
    );

    this.lastMedals$ = this.resource$.pipe(
      switchMap(({ resource_id }: Resource) => {
        return this.medalDefService.getMedalDefs(
          MedalDefFilter.create({ resource_id, skip: 8 })
        );
      }),
      shareReplay()
    );

    this.terms$ = this.resource$.pipe(
      switchMap(({ resource_id }: Resource) => {
        return this.termService.getTerms({ resource_id });
      })
    );
  }
}
