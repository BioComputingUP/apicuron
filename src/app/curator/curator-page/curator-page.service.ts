import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { combineLatest, Observable } from "rxjs";

import { map, shareReplay, switchMap } from "rxjs/operators";
import { MedalsService } from "src/app/achievements/services/medals.service";
import { AuthService } from "src/app/auth/auth.service";
import { CuratorStatisticsService } from "src/app/curator-statistics/services/curator-statistics.service";
import { CuratorService } from "src/app/curator/curator.service";
import {
  BipScholarStats,
  BipScholarStatsViewModel,
} from "src/app/models/external/bip-scholar.model";
import { Resource } from "src/app/models/resource.model";
import { CuratorStatistics } from "src/app/models/statistics.model";
import { User } from "src/app/models/User.model";
import { ResourcesService } from "src/app/resource/service/resources.service";
import { environment } from "../../../environments/environment";

export interface StatisticsWithResource {
  resource: Resource;
  curatorStatistics: CuratorStatistics;
}

@Injectable()
export class CuratorPageService {
  private wsUrl = environment.ws;
  private orcid_url = environment.orcid_url;
  private bip_url = environment.bip_scholar_api_url;
  private stage = environment.env;
  // state observables
  curator$: Observable<User>;
  resources$: Observable<Resource[]>;
  statistics$: Observable<CuratorStatistics[]>;
  statisticsWithResource$: Observable<StatisticsWithResource[]>;
  resourceIds$: Observable<string[]>;
  medals$: Observable<any[]>;
  bip_stats$: Observable<any>;
  constructor(
    private http: HttpClient,
    private resources: ResourcesService,
    private curatorStatistics: CuratorStatisticsService,
    private curatorService: CuratorService,
    private medalsService: MedalsService,
    private authService: AuthService
  ) {
    // load statistics
  }

  public init(orcid_id$: Observable<string>) {
    // setting up the curator behavior subject
    this.curator$ = this.load_curator(orcid_id$);

    // loading the statistics
    this.statistics$ = this.load_statistics(orcid_id$);

    this.resourceIds$ = this.statistics$.pipe(
      // extract to list of resource_ids
      map((stats: CuratorStatistics[]) => stats.map((stat) => stat.resource_id))
    );
    this.bip_stats$ = this.getBipScholarScores(orcid_id$);

    // load resources using statistics
    // this.resources$ = this.loadResources(this.resourceIds$)

    // load statistics with resources grouped
    // this.statisticsWithResource$ = this.combine_resources_statistics(this.resources$, this.statistics$)
  }

  public getCurator() {
    return this.curator$;
  }

  public getResources() {
    return this.resources$;
  }

  public getStatistics() {
    return this.statistics$;
  }

  public getStatisticsWithResource() {
    return this.statisticsWithResource$;
  }

  load_curator(orcid_id$: Observable<string>) {
    return orcid_id$.pipe(
      switchMap((orcid_id: string) => {
        return this.curatorService.get_curator(orcid_id);
      }),
      shareReplay(1),
      map((curator: User) => {
        return new User().deserialize(curator);
      })
    );
  }

  private load_statistics(
    orcid_id$: Observable<string>
  ): Observable<CuratorStatistics[]> {
    return orcid_id$.pipe(
      switchMap((orcid_id: string) => {
        return this.curatorStatistics.get_curator_statistics(orcid_id);
      }),
      shareReplay(1)
    );
  }

  private combine_resources_statistics(
    resources$: Observable<Resource[]>,
    curatorStatistics$: Observable<CuratorStatistics[]>
  ): Observable<StatisticsWithResource[]> {
    // Done: Finish implementation
    return combineLatest([resources$, curatorStatistics$]).pipe(
      map(([resources, curatorStats]) => {
        return curatorStats.map((stat) => {
          return {
            resource: resources.find(
              (res) => res.resource_id == stat.resource_id
            ),
            curatorStatistics: stat,
          };
        });
      })
    );
  }

  private loadResources(
    resourceIds$: Observable<string[]>
  ): Observable<Resource[]> {
    // use resource_id array to load resources
    return resourceIds$.pipe(
      switchMap((resourceIds: string[]) => {
        const resourcesArray$ = resourceIds.map((resource_id: string) =>
          this.resources.get_resource(resource_id)
        );
        return combineLatest(resourcesArray$);
      })
    );
  }

  get_resource_terms(resource_id: string) {
    return this.http.get(this.wsUrl + "/terms", {
      headers: {
        version: "2",
      },
      params: {
        resource_id,
      },
    });
  }

  getBipScholarScores(
    orcid$: Observable<string>
  ): Observable<BipScholarStatsViewModel | null> {
    if (this.stage === "development") {
      // Avoid calling the service in dev environment
      return new Observable((observer) => {
        observer.next(null);
        observer.complete();
      });
    }
    return orcid$.pipe(
      switchMap((orcid: string) => {
        let query_orcid = this.stage == "local" ? "0000-0003-0555-4128" : orcid;
        return this.http.get(this.bip_url + `/${query_orcid}`, {
          headers: {
            accept: "application/json",
          },
        });
      }),
      map((response: any) => {
        if (!response || Object.keys(response).length === 0) {
          return null; // Return null if no data is available
        }
        const bipScholarStats = new BipScholarStats()
          .deserialize(response)
          .statCardViewModel();
        return bipScholarStats;
      }),
      shareReplay(1)
    );
  }

  public isOwnProfile(routeOrcid$: Observable<string>): Observable<boolean> {
    return combineLatest([routeOrcid$, this.authService.loggedInOrcid$]).pipe(
      map(([routeOrcid, loggedInOrcid]) => {
        if (!loggedInOrcid) {
          return false;
        }
        return routeOrcid === loggedInOrcid;
      }),
      shareReplay(1)
    );
  }
}
