import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { map, shareReplay, switchMap } from "rxjs/operators";
// import { uniqueNameValidator } from "../validators/unique-name.validator";
import { TermsService } from "../../terms/services/terms.service";
import { ResourcesService } from "../../resource/service/resources.service";
import { Resource } from "../../models/resource.model";
// import { TermsFilter } from "../../terms/models/terms-filter";
import { Term } from "../../models/term.model";
import { BadgeDefService } from "../../achievements-def/services/badge-def.service";
import { BadgeDefFilter } from "../../achievements-def/interfaces/badge-def.filter";
import { BadgeDef } from "../../models/badge-def.model";

@Component({
  selector: "manage-badges",
  templateUrl: "./manage-badges.component.html",
  styleUrls: ["./manage-badges.component.scss"],
})
export class ManageBadgesComponent implements OnInit, OnDestroy {
    resourceId$: Observable<string>;
    badgesSubscription: Subscription;

  constructor(
    protected route: ActivatedRoute,
    // protected achievmentsDefService: AchievmentsDefService,
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
        })
    )

    this.terms$ = this.resource$.pipe(
        switchMap(({ resource_id }: Resource) => {
            return this.termsService.getTerms({ resource_id })
        }),
        shareReplay(),
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
    )

    this.badgesSubscription = this.resource$
      .pipe(
        switchMap(({resource_id }: Resource) => {
          return this.badgeDefService.getBadgeDefs(BadgeDefFilter.create({ resource_id }));
        })
      )
      .subscribe((badges: any) => {
        this.badges$.next(badges);
      });
  }
    ngOnDestroy(): void {
        this.badgesSubscription.unsubscribe();
    }

  resource$: Observable<Resource>;
  terms$: Observable<any>;

  show_edit_form = false;
  show_create_form = false;
  badges$ = new BehaviorSubject<Array<any>>([]);
  edit_form: FormGroup;
  create_form: FormGroup;

  ngOnInit(): void {
    
  }

  private update_badge(badge_update) {
    const badges = this.badges$.value;
    const update_index = badges.findIndex(
      (badge) => badge.name == badge_update.name
    );
    badges[update_index] = badge_update;
    this.badges$.next(badges);
  }

  private create_badge(badge) {
    const badges = this.badges$.value;
    this.badges$.next([badge, ...badges]);
  }

  open_edit_modal(badge) {
    this.edit_form = this.formBuilder.group({
      name: [badge.name, [Validators.required]],
      color_code: [
        badge.color_code,
        [
          Validators.required,
          Validators.pattern(
            /(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/
          ),
        ],
      ],
      count_threshold: [
        badge.count_threshold,
        [Validators.required, Validators.min(1)],
      ],
      list_terms: [badge.list_terms, [Validators.required]],
    });
    this.show_edit_form = true;
  }

  edit_form_submit() {
    const data = this.edit_form.value;
    this.resource$
      .pipe(
        map(({ resource_id, resource_uri }: any) => {
          return {
            ...data,
            resource_id,
            resource_uri,
          };
        }),
        switchMap((badge_data: any) => {
          return this.badgeDefService.updateBadgeDef(badge_data);
        })
      )
      .subscribe(
        (response) => {
          if (response["data"]) {
            this.toastr.success(
              `Badge ${data.name} sucessfully update`,
              "Badge Update Sucessfull"
            );
            this.update_badge(data);
          }
        },
        (error) => {
          this.toastr.error(
            `An error occured while updating the badge ${data.name}`,
            "Badge Update Failed"
          );
        }
      );
  }

  open_create_modal() {
    this.create_form = this.formBuilder.group({
      name: ["", [Validators.required]],
      color_code: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/
          ),
        ],
      ],
      count_threshold: [1, [Validators.required, Validators.min(1)]],
      list_terms: [[], [Validators.required]],
    });
    this.show_create_form = true;
  }

  create_form_submit() {
    const data = this.create_form.value;
    this.resource$
      .pipe(
        map(({ resource_id, resource_uri }: any) => {
          return {
            ...data,
            resource_id,
            resource_uri,
          };
        }),
        switchMap((badge_data: any) => {
            const badgeDef = new BadgeDef().deserialize(badge_data);
            return this.badgeDefService.createBadgeDef(badgeDef);
        })
      )
      .subscribe(
        (response) => {
          if (response["data"]) {
            this.toastr.success(
              `Badge ${data.name} sucessfully Created`,
              "Badge Creation Sucessfull"
            );
            this.create_badge(response["data"]);
          }
        },
        (error) => {
          this.toastr.error(
            `An error occured while updating the badge ${data.name}`,
            "Badge Update Failed"
          );
        }
      );
  }

  get edit_form_color_code() {
    return this.edit_form.get("color_code");
  }

  get create_form_color_code() {
    return this.create_form.get("color_code");
  }

  delete_badge(badge) {
    this.badgeDefService.deleteBadge(badge).subscribe(
      (response) => {
        if (response["data"]) {
          this.toastr.success(
            `Badge ${badge.name} sucessfully Created`,
            "Badge Creation Sucessfull"
          );
          const badges = this.badges$.value;
          const filtered_badges = badges.filter((x) => x.name != badge.name);
          this.badges$.next(filtered_badges);
        }
      },
      (error) => {
        this.toastr.error(
          `An error occured while updating the badge ${badge.name}`,
          "Badge Update Failed"
        );
      }
    );
  }
}
