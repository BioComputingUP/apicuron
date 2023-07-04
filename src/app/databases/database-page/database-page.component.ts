import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DatabasesService } from "../services/databases.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { catchError, delay, map, pluck, share, shareReplay, switchMap, tap } from "rxjs/operators";
import { combineLatest, interval, Observable } from "rxjs";
import { CuratorPageService } from "src/app/curator/curator-page/curator-page.service";
import { CuratorService } from "src/app/curator/curator.service";
@Component({
  selector: "app-database-page",
  templateUrl: "./database-page.component.html",
  styleUrls: ["./database-page.component.scss"],
})
export class DatabasePageComponent implements OnInit, AfterViewInit {
  resourceId$: Observable<string>;
  leaderboard$: Observable<Object>;
  badges$: Observable<any>;
  medals$: Observable<any>;
  terms$: Observable<any>;
  resource$: Observable<Object>;
  stats$: Observable<unknown>;
  users$: Observable<unknown>;
  leaderboardLoaded$: Observable<Boolean>;


  constructor(
    private databaseService: DatabasesService,
    private curatorService: CuratorService,
    private route: ActivatedRoute
  ) {}


  ngAfterViewInit(): void {
    const subscription = interval(1000).pipe(
      delay(500),
      tap((number) => {
        const el: HTMLDivElement = this.mainPanel?.nativeElement
        const leaderboard: HTMLDivElement = this.leaderboardPanel?.nativeElement
        if(el){
          const height = el.getBoundingClientRect().height
          leaderboard.style.height = height + 'px'
        }
      })
    )
    
  }

  
  more_badges= false;
  more_medals= false;
  expand_terms = false;

  @ViewChild('mainPanel') mainPanel: ElementRef
  @ViewChild('leaderboardPanel') leaderboardPanel: ElementRef
  
  
  ngOnInit(): void {Observable

    this.resourceId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get('resource_id')
      })
    )


    this.stats$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource_leaderboard(resource_id)
      }),
      shareReplay(),
    )

    this.leaderboard$ = this.stats$.pipe(
      switchMap(({ data }: any) => {
        const users_stats$: Array<Observable<any>> = data.map(
          (stat) => {
            return this.curatorService.get_curator(stat.curator_orcid).pipe(
              map((curator) => {
                return { ...curator, stats: [stat]}
              })
            )
          }
        )
        return combineLatest(users_stats$);
      }),
      shareReplay(),
    )
    
    this.leaderboardLoaded$ = this.leaderboard$.pipe(
      map((leaderboard: Array<any>): Boolean => {
        return !!leaderboard && leaderboard.length > 0
      })
    )



    
    this.resource$ = this.resourceId$.pipe(
      switchMap(
        (resource_id: string) => {
        return this.databaseService.get_resource_details(resource_id)
      }),
      shareReplay()
    )

    this.badges$ = this.resource$.pipe(
      pluck('badges')
    )

    this.medals$ = this.resource$.pipe(
      pluck('medals')
    )

    this.terms$ = this.resource$.pipe(
      pluck('terms')
    )

  }
}
