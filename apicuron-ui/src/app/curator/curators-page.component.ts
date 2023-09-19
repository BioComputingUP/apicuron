import { HttpParams } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map, pluck, shareReplay, switchMap, takeUntil } from "rxjs/operators";
import { CuratorService } from "./curator.service";
import { User } from "../models/User.model";

@Component({
  selector: "app-curator",
  templateUrl: "./curators-page.component.html",
  styleUrls: ["./curators-page.component.scss"],
})
export class CuratorsPageComponent implements OnInit, OnDestroy {
  current_page = 1;
  limit = 15;

  biocurators = [];
  private last_query_params = {};

  biocurators$: Observable<any[]>;

  biocurators_list$: Observable<Array<any>>;
  biocurators_count$: Observable<number>;

  query_params$ = new BehaviorSubject<{ page: number, query?: string }>({ page: 1 });
  destroy$: Subject<Boolean> = new Subject();

  constructor(
    private curatorService: CuratorService,
    private route: ActivatedRoute
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  update_curator_list(query_params: any) {
    this.query_params$.next(query_params);
  }

  update_page(page: number) {
    this.query_params$.next({ ...this.query_params$.value, page });
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {

      if (!!params["search"]) {
        this.query_params$.next({ ...this.query_params$.value, query: params['search'] });
      }
    });

    const users_list_response$ = this.query_params$.pipe(
      switchMap((query_params) => {

        const skip = query_params['page'] * this.limit
        return this.curatorService.search_curators(
          new HttpParams({
            
            fromObject: { skip, limit: this.limit },
          })
        );
      }),
      shareReplay()
    );

    this.biocurators_list$ = users_list_response$.pipe(
      pluck("data"),
      map((data: any[]) => {
        return data.map((entry) => {
          const { stats, ...biocurator } = entry;
          return { stats, biocurator: new User().deserialize(biocurator) };
        });
      }),
    );
    this.biocurators_count$ = users_list_response$.pipe(pluck("meta", "pagination", "total"));
  }
}
