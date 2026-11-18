import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Observable, combineLatest, forkJoin, of } from "rxjs";
import {
  catchError,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
} from "rxjs/operators";
import { Resource } from "src/app/models/resource.model";
import { User } from "src/app/models/User.model";
import { BipScholarStatsViewModel } from "src/app/models/external/bip-scholar.model";
import { CuratorStatistics } from "src/app/models/statistics.model";
import { ResourcesService } from "src/app/resource/service/resources.service";
import { CuratorPageService } from "./curator-page.service";

/** One resource of the profile: its statistics and, once loaded, the resource itself. */
export interface ProfileResourceEntry {
  resourceId: string;
  statistics: CuratorStatistics;
  resource: Resource | null;
}

/** the profile to show, or null when the API does not return it (private or unknown) */
export interface ProfileView {
  user: User | null;
}

/** up to this many resources, the profile opens on the "All" tab */
const ALL_TAB_MAX_RESOURCES = 3;

@Component({
  selector: "app-curator-page",
  templateUrl: "./curator-page.component.html",
  styleUrls: ["./curator-page.component.scss"],
})
export class CuratorPageComponent implements OnInit {
  curator$: Observable<User>;
  profile$: Observable<ProfileView>;
  orcidId$: Observable<string>;
  statistics$: Observable<CuratorStatistics[]>;
  entries$: Observable<ProfileResourceEntry[]>;
  bipScores$: Observable<BipScholarStatsViewModel | null>;
  isOwnProfile$: Observable<boolean>;

  /** resource of the selected tab, null=ALL tab*/
  selectedId: string | null = null;

  private requestedId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private curatorPageService: CuratorPageService,
    private resourcesService: ResourcesService,
    private location: Location
  ) {}

  ngOnInit() {
    this.orcidId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        const orcidId = params.get("orcid_id");
        if (!orcidId) {
          throw new Error("ORCID ID is required");
        }
        return orcidId;
      })
    );
    // the ORCID entries link to /<profile>/<orcid>/<resource_id>
    this.requestedId = this.route.snapshot.paramMap.get("resource_id");

    this.curatorPageService.init(this.orcidId$);
    this.curator$ = this.curatorPageService.getCurator();
    // the API answers the same for a private and an unknown profile; so does the page
    this.profile$ = this.curator$.pipe(
      map((user): ProfileView => ({ user })),
      catchError(() => of<ProfileView>({ user: null })),
      shareReplay(1)
    );
    this.statistics$ = this.curatorPageService.getStatistics();

    this.entries$ = this.statistics$.pipe(
      switchMap((statistics) =>
        combineLatest([of(statistics), this.loadResources(statistics)])
      ),
      map(([statistics, resources]) =>
        statistics.map((stat) => ({
          resourceId: stat.resource_id,
          statistics: stat,
          resource: resources.get(stat.resource_id) ?? null,
        }))
      ),
      tap((entries) => this.initSelection(entries)),
      shareReplay(1)
    );
  }

  /** null selects the "All" tab */
  select(resourceId: string | null) {
    this.selectedId = resourceId;
    this.updateUrl(resourceId);
  }

  isShown(entry: ProfileResourceEntry): boolean {
    return this.selectedId === null || entry.resourceId === this.selectedId;
  }

  trackEntry(_index: number, entry: ProfileResourceEntry) {
    return `${entry.resourceId}:${entry.statistics.league}`;
  }

  private loadResources(
    statistics: CuratorStatistics[]
  ): Observable<Map<string, Resource>> {
    const ids = [...new Set(statistics.map((stat) => stat.resource_id))];
    if (ids.length === 0) {
      return of(new Map());
    }
    // take(1): requests never complete (the auth interceptor follows the login headers),
    // and forkJoin waits for every request to complete
    return forkJoin(
      ids.map((id) =>
        this.resourcesService.get_resource(id).pipe(
          take(1),
          catchError(() => of(null))
        )
      )
    ).pipe(
      map(
        (resources) =>
          new Map(
            resources
              .filter((resource): resource is Resource => !!resource)
              .map((resource) => [resource.resource_id, resource])
          )
      )
    );
  }

  private initSelection(entries: ProfileResourceEntry[]) {
    const requested = entries.find((e) => e.resourceId === this.requestedId);
    if (requested) {
      this.selectedId = requested.resourceId;
    } else if (entries.length > ALL_TAB_MAX_RESOURCES) {
      this.selectedId = entries[0].resourceId;
    } else {
      this.selectedId = null;
    }
  }

  /** keeps the address on /<profile>/<orcid>[/<resource_id>] without reloading the page */
  private updateUrl(resourceId: string | null) {
    const [profilePath, orcidId] = this.location
      .path()
      .split("?")[0]
      .split("/")
      .filter(Boolean);
    if (profilePath && orcidId) {
      const suffix = resourceId ? `/${resourceId}` : "";
      this.location.replaceState(`/${profilePath}/${orcidId}${suffix}`);
    }
  }
}
