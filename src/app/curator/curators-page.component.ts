import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { CuratorService } from "./curator.service";

@Component({
  selector: "app-curator",
  templateUrl: "./curators-page.component.html",
  styleUrls: ["./curators-page.component.scss"],
})
export class CuratorsPageComponent implements OnInit {
  current_page = 1;
  page_size = 9;

  biocurators = [];
  private last_query_params = {};

  biocurators$: Observable<any[]>;

  biocurators_list$: Observable<Array<any>>;
  biocurators_count$: Observable<number>;


  query_params$ = new BehaviorSubject<any>({});

  constructor(
    private curatorService: CuratorService,
    private route: ActivatedRoute,
  ) {

  }

  update_curator_list(query_params: any) {
    this.query_params$.next(query_params)
  }

  update_page(page: number) {
    this.query_params$.next({ ...this.query_params$.value, page })
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      let query_params = {};

      if (!!params["search"]) {
        query_params = {
          query: params["search"],
        };
      }
      this.query_params$.next(query_params)
    });

    const users_list_response$ = this.query_params$.pipe(
      switchMap((query_params) => {
        return this.curatorService
          .search_curators(
            new HttpParams({
              fromObject: { ...query_params, page_size: this.page_size },
            })
          )
      }),
      shareReplay()
    )

    this.biocurators_list$ = users_list_response$.pipe(pluck('data'));
    this.biocurators_count$ = users_list_response$.pipe(pluck('count'))
  }
}
