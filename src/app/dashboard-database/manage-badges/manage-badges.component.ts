import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  combineLatest,
  of,
} from "rxjs";
import {
  catchError,
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from "rxjs/operators";
import { TermsService } from "../../terms/services/terms.service";
import { ResourcesService } from "../../resource/service/resources.service";
import { Resource } from "../../models/resource.model";
import { Term } from "../../models/term.model";
import { BadgeDefService } from "../../achievements-def/services/badge-def.service";
import { BadgeDefFilter } from "../../achievements-def/interfaces/badge-def.filter";
import { BadgeDef } from "../../models/badge-def.model";
import { Paginated } from "src/app/interfaces/paginated";

type BadgeListUpdate = {
  badge: BadgeDef;
  operation: "update" | "delete" | "create";
};

@Component({
  selector: "manage-badges",
  templateUrl: "./manage-badges.component.html",
  styleUrls: ["./manage-badges.component.scss"],
})
export class ManageBadgesComponent implements OnInit, OnDestroy {
  resourceId$: Observable<string>;

  resource$: Observable<Resource>;
  termList$: Observable<Term[]>;
  terms$: Observable<any>;

  searchQuery: string = '';

  badges$: Observable<Paginated<BadgeDef>>;
  manageForm$ = new BehaviorSubject<{
    badge: BadgeDef;
    show: boolean;
    type: "create" | "update";
  }>({ badge: null, show: false, type: "create" });

  badgeFilter$: Observable<BadgeDefFilter>;
  page$ = new BehaviorSubject<number>(1);
  limit: number = 15;
  destroy$ = new Subject<boolean>();
  updateBadge$ = new Subject<BadgeListUpdate>();
  badgesList$: Observable<Paginated<BadgeDef>>;

  constructor(
    protected route: ActivatedRoute,
    protected badgeDefService: BadgeDefService,
    // protected formBuilder: FormBuilder,
    protected toastr: ToastrService,
    protected termsService: TermsService,
    protected resourceService: ResourcesService
  ) {
    this.resourceId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("resource_id");
      })
    );

    this.resource$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.resourceService.get_resource(resource_id);
      }),
      shareReplay()
    );

    this.termList$ = this.resource$.pipe(
      switchMap(({ resource_id }: Resource) => {
        return this.termsService.getTerms({ resource_id }).pipe(shareReplay());
      }),
      shareReplay()
    );

    this.terms$ = this.termList$.pipe(
      map((terms: Term[]) => {
        const groupValues = ["generation", "invalidation", "revision"].map(
          (category: string) => {
            return { label: category, value: category, items: [] };
          }
        );
        terms.forEach((term: Term) => {
          const concernedCategory = groupValues.find(
            (cat) => cat.value == term.category
          );
          concernedCategory.items.push({
            label: term.activity_name,
            value: term.activity_term,
          });
        });
        return groupValues;
      })
    );

    this.badgeFilter$ = combineLatest([this.resource$, this.page$]).pipe(
      map(([{ resource_id }, page]: [Resource, number]) => {
        return BadgeDefFilter.create({
          resource_id,
          skip: (page - 1) * this.limit,
          limit: this.limit,
        });
      })
    );

    this.badgesList$ = this.badgeFilter$.pipe(
      switchMap((badgeFilter: BadgeDefFilter) => {
        return this.badgeDefService.getBadgeDefs(badgeFilter);
      }),
      shareReplay(),
      map((paginatedBadges: Paginated<BadgeDef>) => {
        paginatedBadges.data = paginatedBadges.data.map((badge: BadgeDef) => {
          return new BadgeDef().deserialize(badge);
        });
        return paginatedBadges;
      })
    );

    this.badges$ = this.badgesList$.pipe(
      switchMap((badgeList: Paginated<BadgeDef>) => {
        return this.updateBadge$.pipe(
          startWith(badgeList),
          scan((badges: Paginated<BadgeDef>, update: BadgeListUpdate) => {
            return this.applyBadgeUpdates(badges, update);
          })
        ) as Observable<Paginated<BadgeDef>>;
      }),
      map(badges => {
        if (!badges) return badges;
        let filteredBadges = badges;
        if (this.searchQuery) {
          filteredBadges = {
            ...badges,
            data: badges.data.filter(badge =>
              badge.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            ),
          };
        }
        return filteredBadges;
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  ngOnInit(): void {}

  onSearchChange() {
    this.page$.next(1);
  }
  private updateBadgeUI(badge: BadgeDef) {
    this.updateBadge$.next({
      operation: "update",
      badge,
    });
  }

  applyBadgeUpdates(
    badges: Paginated<BadgeDef>,
    update: BadgeListUpdate
  ): Paginated<BadgeDef> {
    switch (update.operation) {
      case "create":
        return {
          data: [...badges.data, update.badge],
          meta: {
            pagination: {
              total: badges.meta.pagination.total + 1,
              start: badges.meta.pagination.start,
              limit: badges.meta.pagination.limit + 1,
            },
          },
        };
      case "update":
        return {
          data: badges.data.map((badge) => {
            if (badge.name == update.badge.name) {
              return update.badge;
            }
            return badge;
          }),
          meta: badges.meta,
        };
      case "delete":
        return {
          data: badges.data.filter((badge) => badge.name != update.badge.name),
          meta: {
            pagination: {
              total: badges.meta.pagination.total - 1,
              start: badges.meta.pagination.start,
              limit: badges.meta.pagination.limit - 1,
            },
          },
        };
    }
  }

  update_page(page) {
    this.page$.next(page);
  }

  private addBadgeToUI(badge) {
    this.updateBadge$.next({ operation: "create", badge });
  }

  open_form(badge) {
    this.manageForm$.next({
      badge,
      type: "update",
      show: true,
    });
  }

  createBadge(badgeDef: BadgeDef) {
    this.badgeDefService
      .createBadgeDef(badgeDef).pipe(take(1))
      .subscribe((data: BadgeDef) => {
        if (data) {
          this.addBadgeToUI(data);
        }
      });
  }

  updateBadge(badgeDef: BadgeDef) {
    this.badgeDefService
      .updateBadgeDef(badgeDef)
      .pipe(take(1))
      .subscribe((data: BadgeDef) => {
        if (data) {
          this.updateBadgeUI(data);
        }
      });
  }

  open_create_form(resource_id) {
    this.manageForm$.next({
      badge: new BadgeDef().deserialize({ resource_id }),
      type: "create",
      show: true,
    });
  }

  formSubmit({
    badge,
    operation,
  }: {
    badge: BadgeDef;
    operation: "create" | "update";
  }) {
    if (operation == "update") {
      this.updateBadge(badge);
    }
    if (operation == "create") {
      this.createBadge(badge);
    }
    this.manageForm$.next({ badge: null, show: false, type: "create" });
  }

  delete_badge(badge) {
    this.badgeDefService
      .deleteBadge(badge)
      .pipe(take(1))
      .subscribe(
        (response) => {
          if (response["data"]) {
            this.toastr.success(
              `Badge ${badge.name} sucessfully Deleted`,
              "Badge Deletion Sucessfull"
            );
            this.updateBadge$.next({ operation: "delete", badge });
          }
        },
        (error) => {
          this.toastr.error(
            `An error occured while deleting the badge ${badge.name}`,
            "Badge Deletion Failed"
          );
        }
      );
  }


  onCloseForm() {
    this.manageForm$.next({ badge: null, show: false, type: "create" });
  }

}
