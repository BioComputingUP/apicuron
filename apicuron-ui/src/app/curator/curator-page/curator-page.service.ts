import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { combineLatest, Observable } from "rxjs";

import { map, shareReplay, switchMap } from "rxjs/operators";
import { CuratorStatisticsService } from "src/app/curator-statistics/services/curator-statistics.service";
import { CuratorService } from "src/app/curator/curator.service";
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

  // state observables
  curator$: Observable<User>;
  resources$: Observable<Resource[]>;
  statistics$: Observable<CuratorStatistics[]>;
  statisticsWithResource$: Observable<StatisticsWithResource[]>;
  resourceIds$: Observable<string[]>;
  medals$: Observable<any[]>;

  constructor(
    private http: HttpClient,
    private resources: ResourcesService,
    private curatorStatistics: CuratorStatisticsService,
    private curatorService: CuratorService
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
}
