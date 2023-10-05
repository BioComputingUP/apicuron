import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
import {
  catchError,
  map,
  shareReplay,
  switchMap,
  take,
  takeUntil,
  tap,
} from "rxjs/operators";
// import { uniqueNameValidator } from "../validators/unique-name.validator";
import { TermsService } from "../../terms/services/terms.service";
import { ResourcesService } from "../../resource/service/resources.service";
import { Resource } from "../../models/resource.model";
// import { TermsFilter } from "../../terms/models/terms-filter";
import { Term } from "../../models/term.model";
import { BadgeDefService } from "../../achievements-def/services/badge-def.service";
import { BadgeDefFilter } from "../../achievements-def/interfaces/badge-def.filter";
import { BadgeDef } from "../../models/badge-def.model";
import { Paginated } from "src/app/interfaces/paginated";

@Component({
  selector: "manage-badges",
  templateUrl: "./manage-badges.component.html",
  styleUrls: ["./manage-badges.component.scss"],
})
export class ManageBadgesComponent implements OnInit, OnDestroy {
  resourceId$: Observable<string>;

  resource$: Observable<Resource>;
  terms$: Observable<any>;

  badges$ = new BehaviorSubject<Paginated<BadgeDef>>({
    data: [],
    meta: { pagination: { start: 1, limit: 1, total: 0 } },
  });
  manageForm$ = new BehaviorSubject<{
    badge: BadgeDef;
    show: boolean;
    type: "create" | "update";
  }>({ badge: null, show: false, type: "create" });

  destroy$ = new Subject<boolean>();

  constructor(
    protected route: ActivatedRoute,
    protected badgeDefService: BadgeDefService,
    protected formBuilder: FormBuilder,
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

    this.terms$ = this.resource$.pipe(
      switchMap(({ resource_id }: Resource) => {
        return this.termsService.getTerms({ resource_id });
      }),
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

    this.resource$
      .pipe(
        switchMap(({ resource_id }: Resource) => {
          return this.badgeDefService.getBadgeDefs(
            BadgeDefFilter.create({ resource_id, limit: 15 })
          );
        }),
        shareReplay(),
        map((paginatedBadges: Paginated<BadgeDef>) => {
          paginatedBadges.data = paginatedBadges.data.map((badge: BadgeDef) => {
            return new BadgeDef().deserialize(badge);
          });
          return paginatedBadges;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((badges: any) => {
        this.badges$.next(badges);
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  ngOnInit(): void {}

  private(badge_update) {
    const badges = this.badges$.value;
    const update_index = badges.data.findIndex(
      (badge) => badge.name == badge_update.name
    );
    if (update_index != -1) {
      badges.data[update_index] = badge_update;
      this.badges$.next(badges);
    }
  }

  private addBadgeToUI(badge) {
    const badges = this.badges$.value;
    badges.data = [badge, ...badges.data];
    this.badges$.next(badges);
  }

  open_form(badge) {
    this.manageForm$.next({
      badge,
      type: "update",
      show: true,
    });
  }

  createBadge(badgeDef: BadgeDef) {
    this.badgeDefService.createBadgeDef(badgeDef).subscribe(
      ({ data }: { data: BadgeDef }) => {
        if (data) {
          this.toastr.success(
            `Badge ${data.name} sucessfully Created`,
            "Badge Creation Sucessfull"
          );
          this.addBadgeToUI(data);
        }
      },
      (error) => {
        this.toastr.error(
          `An error occured while creating the badge ${badgeDef.name}`,
          "Badge Creation Failed"
        );
      }
    );
  }

  updateBadge(badgeDef: BadgeDef) {
    this.badgeDefService
      .updateBadgeDef(badgeDef)
      .pipe(
        take(1),
        catchError((error, caught) => {
          this.toastr.error(
            `An error occured while updating the badge ${badgeDef.name}`,
            "Badge Update Failed"
          );
          throw error;
        })
      )
      .subscribe({
        next({ data }: { data: BadgeDef }) {
          if (data) {
            this.toastr.success(
              `Badge ${data.name} sucessfully Updated`,
              "Badge Update Sucessfull"
            );
            this.addBadgeToUI(data);
          }
        },
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
  }

  delete_badge(badge) {
    this.badgeDefService.deleteBadge(badge).subscribe(
      (response) => {
        if (response["data"]) {
          this.toastr.success(
            `Badge ${badge.name} sucessfully Deleted`,
            "Badge Deletion Sucessfull"
          );
          const badges = this.badges$.value;
          badges.data = badges.data.filter((x) => x.name != badge.name);
          this.badges$.next(badges);
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
}
