import { Component, OnInit } from "@angular/core";
import {
  ActivatedRoute,
  ParamMap,
} from "@angular/router";
import { combineLatest, Observable } from "rxjs";
import { map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { DatabasesService } from "../../databases/services/databases.service";
import {
  CuratorPageService,
} from "./curator-page.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-curator-page",
  templateUrl: "./curator-page.component.html",
  styleUrls: ["./curator-page.component.scss"],
})
export class CuratorPageComponent implements OnInit {
  curator$: Observable<any>;
  orcidId$: Observable<string>;

  resourceId$: Observable<string>;

  user_stats$: Observable<any>;
  resource$: Observable<Object>;
  user_resources$: Observable<any[]>;
  keywords$: Observable<string[]>;
  biography$: Observable<string>;
  orcid_links$: Observable<any>;

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
        if (stats.length > 0) {
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

    this.keywords$ = this.orcidId$.pipe(
      switchMap((orcid_id: string) => {
        return this.curatorPageService.get_orcid_keywords(orcid_id)
      })
    )

    this.biography$ = this.orcidId$.pipe(
      switchMap((orcid_id: string) => {
        return this.curatorPageService.get_orcid_biography(orcid_id);
      })
    )

    this.orcid_links$ = this.orcidId$.pipe(
      switchMap((orcid_id: string) => {
        return this.curatorPageService.get_orcid_links(orcid_id);
      })
    )

  }


  orcid_link(orcid_id: string){
      return new URL(orcid_id, environment.orcid_main_url).href
  }

  

  generate_avatar(name: string){
    const emailHash = encodeURIComponent(name);
    const defaultImage = encodeURIComponent(`https://api.dicebear.com/5.x/identicon/png/seed=${emailHash}&scale=80&radius=50`);
    return `https://www.gravatar.com/avatar/${emailHash}?d=${defaultImage}`;
  }

  ngOnInit() { }
}
