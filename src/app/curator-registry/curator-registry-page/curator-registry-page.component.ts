import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CuratorRegistryService } from "../curator-registry.service";
import { combineLatest, Observable, Subject } from "rxjs";
import {
  map,
  pluck,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from "rxjs/operators";
import { RegistryEntry } from "src/app/models/registryEntry.model";
import { BehaviorSubject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { HttpParams } from "@angular/common/http";
import { PaginationComponent } from "projects/apicuron-util/src/lib/pagination/pagination.component";
import { Paginated } from "src/app/interfaces/paginated";
@Component({
  selector: "curator-registry-page",
  templateUrl: "./curator-registry-page.component.html",
  styleUrls: ["./curator-registry-page.component.scss"],
})
export class CuratorRegistryPageComponent implements OnInit, OnDestroy {
  limit = 9;
  entries$: Observable<Array<RegistryEntry>>;
  destroy$: Subject<Boolean> = new Subject();
  page$ = new BehaviorSubject<number>(1);
  users_list_response$: Observable<Paginated<RegistryEntry>>;
  query_params$ = new BehaviorSubject<{ query?: string }>({});

  constructor(
    protected registryService: CuratorRegistryService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (!!params["search"]) {
          this.query_params$.next({
            ...this.query_params$.value,
            query: params["search"],
          });
        }
      });
    //data used for paginator
    this.users_list_response$ = combineLatest([
      this.page$,
      this.query_params$,
    ]).pipe(
      switchMap(([page, query_params]) => {
        const skip = ((page || 1) - 1) * this.limit;
        return this.registryService.getAllCurators(
          new HttpParams({
            fromObject: { ...query_params, limit: this.limit, skip: skip },
          })
        );
      }),
      shareReplay()
    );

    // data used to display.
    this.entries$ = this.users_list_response$.pipe(
      pluck("data"),
      map((data: any[]) =>
        data.map((element) => new RegistryEntry().deserialize(element))
      )
    );
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
  ngOnInit(): void {
    this.users_list_response$.subscribe((data) =>
      console.log("Updated Users List:", data)
    );
    this.query_params$.subscribe((data) =>
      console.log("Updated Query Params:", data)
    );
  }

  pageChanged(event: { page: number }) {
    this.page$.next(event.page);
  }

  update_curator_list(query_params: any) {
    this.query_params$.next(query_params);
  }
}
