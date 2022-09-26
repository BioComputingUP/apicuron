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
import { map, shareReplay, switchMap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
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
  // user_reports$: Observable<
  //   { activity_name: any; description: any; timestamp: string }[]
  // >;
  // achievements$: Observable<unknown>;

  constructor(
    private route: ActivatedRoute,
    private curatorPageService: CuratorPageService
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

    this.resourceId$ = combineLatest([this.route.fragment, this.curator$]).pipe(
      map(([fragment, curator]) => {
        if (!!fragment) {
          // if the fragment is in the curator stats array, we return it
          if (curator.stats.find((stat) => stat.resource_id == fragment)) {
            return fragment;
          }
        }
        // otherwise we return the first resource_id in the list of stats
        return curator.stats[0].resource_id;
      })
    );

    this.orcidData$ = this.orcidId$.pipe(
      switchMap((orcid_id) =>
        this.curatorPageService.get_curator_orcid_details(orcid_id)
      )
    );

    // this.user_reports$ = combineLatest([this.resourceId$, this.orcidId$]).pipe(
    //   switchMap(([resource_id, orcid_id]) => {
    //     const params = new HttpParams({
    //       fromObject: {
    //         page: "1",
    //         page_size: "10",
    //       },
    //     });
    //     return this.curatorPageService.get_reports(
    //       orcid_id,
    //       resource_id,
    //       params
    //     );
    //   }),
    //   map((reports: Array<Object>) => {
    //     const formatted_reports = reports.map((report) => {
    //       const relativeDate = moment(report["timestamp"]).fromNow();
    //       return {
    //         activity_name: report["term"]["activity_name"],
    //         description: report["term"]["description"],
    //         timestamp: relativeDate,
    //       };
    //     });

    //     return formatted_reports;
    //   })
    // );

    // this.achievements$ = combineLatest([this.resourceId$, this.orcidId$]).pipe(
    //   switchMap(([resourceId, orcidId]) => {
    //     return this.curatorPageService.get_achievements(orcidId, resourceId);
    //   }),
    //   shareReplay()
    // );
  }

  ngOnInit() {}
}
