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
import { User } from "src/app/models/User.model";
import { CuratorService } from "src/app/curator/curator.service";
import { MedalsService } from "src/app/achievements/services/medals.service";
import { Medal } from "../../models/medal.model";
import _ from "lodash";

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
  resourceIds$: Observable<string[]>;
  medals$: Observable<any[]>;

  constructor(
    private http: HttpClient,
    private resources: ResourcesService,
    private curatorStatistics: CuratorStatisticsService,
    private curatorService: CuratorService,
    private medalsService: MedalsService
  ) {
    // load statistics
  }



  public init(orcid_id$: Observable<string>) {
    // setting up the curator behavior subject
    this.curator$ = this.load_curator(orcid_id$)

    // loading the statistics
    this.statistics$ = this.load_statistics(orcid_id$)

    this.resourceIds$ = this.statistics$.pipe(
      // extract to list of resource_ids
      map((stats: CuratorStatistics[]) => stats.map((stat) => stat.resource_id))
    )

    // load resources using statistics
    this.resources$ = this.loadResources(this.resourceIds$)

    // load statistics with resources grouped 
    this.statisticsWithResource$ = this.combine_resources_statistics(this.resources$, this.statistics$)

    // Load Medals for resources
    // this.medals$ = this.curator$.pipe(
    //   switchMap((curator: User) => {
    //     return this.medalsService.getCuratorMedals({ curator_orcid: curator.orcid_id }).pipe(shareReplay(1))
    //   }),
    // )

    // debugger;

  }

  // public getResourceMedals(resource_id: string) {
  //   return this.medals$.pipe(
  //     map((medals: Medal[]) => {
  //       return medals.filter((medal:Medal) => medal.resource_id == resource_id)
  //     })
  //   )
  // }


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

  private load_statistics(orcid_id$: Observable<string>): Observable<CuratorStatistics[]> {
    return orcid_id$.pipe(
      switchMap((orcid_id: string) => {
        return this.curatorStatistics.get_curator_statistics(orcid_id);
      }),
      shareReplay(1)
      )
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

  private loadResources(resourceIds$: Observable<string[]>): Observable<Resource[]> {

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
