import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CuratorRegistryService } from "../curator-registry.service";
import { Observable, Subject } from "rxjs";
import { map, pluck, shareReplay, switchMap, takeUntil } from "rxjs/operators";
import { RegistryEntry } from "src/app/models/registryEntry.model";
import { BehaviorSubject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { HttpParams } from "@angular/common/http";
@Component({
  selector: "curator-registry-page",
  templateUrl: "./curator-registry-page.component.html",
  styleUrls: ["./curator-registry-page.component.scss"],
})
export class CuratorRegistryPageComponent implements OnInit, OnDestroy {
  constructor(
    protected registryService: CuratorRegistryService,
    private route: ActivatedRoute
  ) {}
  limit = 15;
  current_page = 1;
  entries$: Observable<Array<RegistryEntry>>;
  biocurators_count$: Observable<number>;
  destroy$: Subject<Boolean> = new Subject();
  query_params$ = new BehaviorSubject<{ page: number; query?: string }>({
    page: 1,
  });

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
  ngOnInit(): void {
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

    const users_list_response$ = this.query_params$.pipe(
      switchMap((query_params) => {
        const skip = ((query_params["page"] || 1) - 1) * this.limit;

        return this.registryService
          .getAllCurators(
            new HttpParams({
              fromObject: { ...query_params, skip, limit: this.limit },
            })
          )
          .pipe(shareReplay());
      }),
      shareReplay()
    );

    this.entries$ = users_list_response$.pipe(
      pluck("data"),
      map((data: any[]) =>
        data.map((element) => new RegistryEntry().deserialize(element))
      )
    );

    this.biocurators_count$ = users_list_response$.pipe(
      pluck("meta", "pagination", "total")
    );
  }

  update_page(page: number) {
    this.query_params$.next({ ...this.query_params$.value, page });
  }
  update_curator_list(query_params: any) {
    this.query_params$.next(query_params);
  }
}
