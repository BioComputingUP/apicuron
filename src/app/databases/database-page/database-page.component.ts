import { Component, OnInit } from "@angular/core";
import { DatabasesService } from "../services/databases.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { map, pluck, share, shareReplay, switchMap } from "rxjs/operators";
import { Observable } from "rxjs";
@Component({
  selector: "app-database-page",
  templateUrl: "./database-page.component.html",
  styleUrls: ["./database-page.component.scss"],
})
export class DatabasePageComponent implements OnInit {
  resourceId$: Observable<string>;
  leaderboard$: Observable<Object>;
  resource_details$;
  badges$: any;
  medals$: any;
  terms$: any;
  reports$: any;
  resource$: Observable<Object>;


  constructor(
    private databaseService: DatabasesService,
    private route: ActivatedRoute
  ) {}

  
  more_badges= false;
  more_medals= false;

  
  ngOnInit(): void {Observable

    this.resourceId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get('resource_id')
      })
    )

    this.leaderboard$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource_leaderboard(resource_id)
      }),
      shareReplay(),
      pluck('data')
    )
    
    this.resource_details$ = this.resourceId$.pipe(
      switchMap(
        (resource_id: string) => {
        return this.databaseService.get_resource_details(resource_id)
      }),
      shareReplay()
    )

    this.resource$ = this.resource_details$.pipe(pluck('data'))
    

    this.badges$ = this.resource$.pipe(
      pluck('badges')
    )

    this.medals$ = this.resource$.pipe(
      pluck('medals')
    )

    this.terms$ = this.resource$.pipe(
      pluck('terms')
    )

    this.reports$ = this.resource_details$.pipe(
      map((response) => {
        return {
          data: response['data']['reports'],
          page_size: response['reports_page'],
          page:response['reports_page']
        }
      })
    )


  }
}
