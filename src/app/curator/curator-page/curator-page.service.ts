import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute, ParamMap, Params } from "@angular/router";
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  Observable,
  ReplaySubject,
  Subject,
  zip,
} from "rxjs";
import {
  filter,
  map,
  pluck,
  share,
  shareReplay,
  switchMap,
  take,
  tap,
} from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { CuratorStatisticsService } from "src/app/curator-statistics/services/curator-statistics.service";
import { CuratorStatistics } from "src/app/models/statistics.model";
import { ResourcesService } from "src/app/resource/service/resources.service";
import { Resource } from "src/app/models/resource.model";
import { User } from "src/app/models/User";
import { CuratorService } from "src/app/curator/curator.service";

export interface StatisticsWithResource {
  resource: Resource,
  curatorStatistics: CuratorStatistics
}

@Injectable()
export class CuratorPageService {
  private wsUrl = environment.ws;
  private orcid_url = environment.orcid_url;

  // state observables
  curator$: Observable<User>;
  resources$: Observable<Resource[]>;
  statistics$: Observable<CuratorStatistics[]>;
  statisticsWithResource$: Observable<StatisticsWithResource[]>;

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
    this.curator$ = this.load_curator(orcid_id$)

    // loading the statistics
    this.statistics$ = this.load_statistics(orcid_id$)

    // load resources using statistics
    this.resources$ = this.resources_from_statstics(this.statistics$)

    // load statistics with resources grouped 
    this.statisticsWithResource$ = this.combine_resources_statistics(this.resources$, this.statistics$)
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
      pluck("data"),
      map((curator: User) => {
        return new User().deserialize(curator);
      })
    );

  }

  private load_statistics(orcid_id$: Observable<string>): Observable<CuratorStatistics[]> {
    return orcid_id$.pipe(
      switchMap((orcid_id: string) => {
        return this.curatorStatistics.get_curator_statistics(orcid_id);
      }
      ))
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
            resource: resources.find((res) => res.resource_id == stat.resource_id),
            curatorStatistics: stat
          };
        });
      })
    );
  }

  private resources_from_statstics(
    curatorStatistics$: Observable<CuratorStatistics[]>
  ): Observable<Resource[]> {
    // extract resource_id array
    const resourceIds$: Observable<string[]> = curatorStatistics$.pipe(
      map((curator_statistics: CuratorStatistics[]) => {
        return curator_statistics.map(
          (curator_statistic) => curator_statistic.resource_id
        );
      })
    );

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
}
