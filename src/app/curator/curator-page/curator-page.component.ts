import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  ParamMap,
  Router,
} from "@angular/router";
import * as moment from "moment";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { DatabasesService } from "../../databases/services/databases.service";
import {
  Curator,
  CuratorAchievements,
  CuratorPageService,
  CuratorStat,
  OrcidData,
} from "./curator-page.service";

@Component({
  selector: "app-curator-page",
  templateUrl: "./curator-page.component.html",
  styleUrls: ["./curator-page.component.scss"],
})
export class CuratorPageComponent implements OnInit {
  // curator$ = this.curatorPageService.curator$;
  curator$: Observable<any>;
  orcidId$: Observable<string>;

  resourceId$: Observable<string>;

  // private wsUrl = environment.ws;
  // private orcid_url = environment.orcid_url;
  orcidData$: Observable<OrcidData>;
  user_stats$: Observable<any>;
  resource$: Observable<Object>;
  user_resources$: Observable<any[]>;
  // user_reports$: Observable<
  //   { activity_name: any; description: any; timestamp: string }[]
  // >;
  // achievements$: Observable<unknown>;

  constructor(
    private route: ActivatedRoute,
    private curatorPageService: CuratorPageService,
    private databaseService: DatabasesService
  ) {
    this.orcidId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("orcid_id");
      })
    );

    this.curator$ = this.orcidId$.pipe(
      switchMap((orcidId) => this.curatorPageService.get_curator(orcidId)),
      shareReplay()
    );

    this.user_stats$ = this.orcidId$.pipe(
      switchMap((orcid_id: string) => {
        return this.curatorPageService.curator_statistics(orcid_id)
      }),
      shareReplay(),
      pluck('data')
    )

    this.resourceId$ = combineLatest([this.route.fragment, this.user_stats$]).pipe(
      map(([fragment, stats]) => {
        if (!!fragment) {
          // if the fragment is in the curator stats array, we return it
          if (stats.find((stat) => stat.resource_id == fragment)) {
            return fragment;
          }
        }
        if(stats.length > 0){
          // otherwise we return the first resource_id in the list of stats
          return stats[0].resource_id;
        }
      })
    );
    
    this.user_resources$ = this.user_stats$.pipe(
      switchMap((user_stats) => {
        const resource_ids = user_stats.map(stat => stat.resource_id)
        const resources$: Array<Observable<any>> = resource_ids.map(resource_id => {
          return this.databaseService.get_resource(resource_id).pipe(pluck('data'))
        })
        return combineLatest(resources$)
      }),
      shareReplay()
    )

    this.resource$ = combineLatest([this.resourceId$, this.user_resources$]).pipe(
      map(([resource_id, resources]) => {
        return resources.find(resource => resource.resource_id == resource_id)
      })
    )

    this.orcidData$ = this.orcidId$.pipe(
      switchMap((orcid_id) =>
        this.curatorPageService.get_curator_orcid_details(orcid_id)
      )
    );

  }

  ngOnInit() {}
}
