import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { LeaderboardOptions } from "projects/apicuron-util/src/lib/leaderboard/interfaces/leaderboard-options";
import { combineLatest, interval, Observable, of } from "rxjs";
import { delay, map, pluck, shareReplay, startWith, switchMap, tap } from "rxjs/operators";
import { BadgeDefFilter } from "../../achievements-def/interfaces/badge-def.filter";
import { MedalDefFilter } from "../../achievements-def/interfaces/medal-def.filter";
import { BadgeDefService } from "../../achievements-def/services/badge-def.service";
import { MedalDefService } from "../../achievements-def/services/medal-def.service";
import { Paginated } from "../../interfaces/paginated";
import { BadgeDef } from "../../models/badge-def.model";
import { MedalDef } from "../../models/medal-def.model";
import { Resource } from "../../models/resource.model";
import { User } from "../../models/User.model";
import { Term } from "../../models/term.model";
import { TermsService } from "../../terms/services/terms.service";
import { DatabasesService } from "../services/databases.service";

import { HttpParams } from "@angular/common/http";
import { CuratorService } from "../../curator/curator.service";
import { AuthService } from "../../auth/auth.service";

interface StatCard extends Record<string, unknown> {
  label: string;
  valueKey: string;
  iconSrc: string;
  description: string;
  show: boolean;
}

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
  leaderboardOptions$: Observable<LeaderboardOptions>;

  statCards: StatCard[] = [
    {
      label: "Unique Contributors",
      valueKey: "uniqueContributors",
      iconSrc: "assets/svg/member.svg",
      description: `The total number of distinct individuals who have contributed to this resource`,
      show: true,
    },
    {
      label: "Contribution Record",
      valueKey: "contributionCount",
      iconSrc: "assets/svg/contribution.svg",
      description: "The overall count of contributions recorded for this resource in APICURON.",
      show: true,
    },
    {
      label: "First Contribution Date",
      valueKey: "firstContributionDate",
      iconSrc: "assets/svg/joined.svg",
      description: "The date of the first contribution that was captured for this resource.",
      show: true,
    },
    {
      label: "Most Recent Contribution",
      valueKey: "lastContributionDate",
      iconSrc: "assets/svg/clock-plus.svg",
      description: "The date of the most recent contribution recorded by this resource.",
      show: true,
    },
  ];

  constructor(
    public authService: AuthService,
    private databaseService: DatabasesService,
    private curatorService: CuratorService,
    private badgeDefService: BadgeDefService,
    private medalDefService: MedalDefService,
    private termService: TermsService,
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

  @ViewChild("mainPanel") mainPanel: ElementRef;
  @ViewChild("leaderboardPanel") leaderboardPanel: ElementRef;

  topContributors$: Observable<Array<{ user: User; events_count?: number }>>;
  isLoggedOut$: Observable<boolean>;

  ngOnInit(): void {
    Observable;

    this.isLoggedOut$ = this.authService.loggedIn$.pipe(
      map((loggedIn) => !loggedIn),
      startWith(true),
      shareReplay(1)
    );

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

    this.topContributors$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.curatorService.search_curators(
          new HttpParams({
            fromObject: { "resources[]": resource_id, limit: "6", skip: "0" },
          })
        );
      }),
      pluck("data"),
      map((data: any[]) => {
        if (!data || !Array.isArray(data)) return [];
        return data.map((entry: any) => {
          const { stats, ...userData } = entry;
          const user = new User().deserialize(userData);
          const events_count =
            stats?.events_count ??
            stats?.submitted_events_count ??
            stats?.activity_count ??
            0;
          return { user, events_count };
        });
      }),
      shareReplay(1)
    );

    this.resource$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource(resource_id);
      }),
      pluck<{ data: Resource }, "data">("data"),
      shareReplay(1)
    );
    this.leaderboardOptions$ = this.resource$.pipe(
      switchMap((resource: Resource) => {
        return of(resource.leaderboard_preferences.parseIntoOptions());
        // return resource.leaderboard_preferences.parseIntoOptions();
      }),
      shareReplay(1)
    );
    this.terms$ = this.resource$.pipe(
      switchMap(({ resource_id }: Resource) => {
        return this.termService.getTerms({ resource_id });
      })
    );

    this.firstBadges$ = this.resource$.pipe(
      switchMap(({ resource_id }: Resource) => {
        return this.badgeDefService.getBadgeDefs(
          BadgeDefFilter.create({ resource_id, limit: 8 })
        );
      })
    );

    this.lastBadges$ = combineLatest([this.resource$, this.firstBadges$]).pipe(
      delay(500),
      switchMap(([resource, badges]: [Resource, Paginated<BadgeDef>]) => {
        const { resource_id } = resource;
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

    this.lastMedals$ = combineLatest([this.resource$, this.firstMedals$]).pipe(
      delay(500),
      switchMap(([{ resource_id }, _]: [Resource, Paginated<MedalDef>]) => {
        return this.medalDefService.getMedalDefs(
          MedalDefFilter.create({ resource_id, skip: 8 })
        );
      }),
      shareReplay()
    );
  }
}

