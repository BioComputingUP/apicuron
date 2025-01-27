import { Component, OnInit } from "@angular/core";
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
import { map, switchMap, shareReplay, startWith, scan } from "rxjs/operators";
import { ResourcesService } from "../../resource/service/resources.service";
import { Resource } from "../../models/resource.model";
import { TermsService } from "../../terms/services/terms.service";
import { Term } from "../../models/term.model";
import { MedalDefService } from "../../achievements-def/services/medal-def.service";
import { AchievementDefFilter } from "../../achievements-def/interfaces/achievment-def.filter";
import { MedalDef } from "../../models/medal-def.model";
import { MedalDefFilter } from "../../achievements-def/interfaces/medal-def.filter";
import { Paginated } from "../../interfaces/paginated";

type MedalListUpdate = {
  medal: MedalDef;
  operation: "update" | "delete" | "create";
};

@Component({
  selector: "manage-medals",
  templateUrl: "./manage-medals.component.html",
  styleUrls: ["./manage-medals.component.scss"],
})
export class ManageMedalsComponent implements OnInit {
  // Data
  resourceId$: Observable<string>;

  resource$: Observable<Resource>;
  terms$: Observable<any>;

  maxDate = new Date();

  limit = 15;
  searchQuery: string = ''; // Added searchQuery to track the input value

  medals$: Observable<Paginated<MedalDef>>;
  updateMedal$ = new Subject<MedalListUpdate>();

  // Form
  manageForm$ = new Subject<{
    medal: MedalDef;
    show: boolean;
    type: "create" | "update";
  }>();

  // pagination
  page$ = new BehaviorSubject<number>(1);
  medalFilter$: Observable<MedalDefFilter>;
  medalsList$: Observable<Paginated<MedalDef>>;
  allMedals$: Observable<Paginated<MedalDef>>; // Observable to store all medals

  constructor(
    protected route: ActivatedRoute,
    protected medalsDefService: MedalDefService,
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
      shareReplay(),
      // this function serves to group the terms according to the category values
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

    this.medalFilter$ = combineLatest([this.resource$, this.page$]).pipe(
      map(([{ resource_id }, page]: [Resource, number]) => {
        return MedalDefFilter.create({
          resource_id,
          skip: (page - 1) * this.limit,
          limit: this.limit,
        });
      })
    );

    // Fetch all medals without any search filtering
    this.allMedals$ = this.medalFilter$.pipe(
      switchMap((filter: MedalDefFilter) => {
        return this.medalsDefService.getMedalDefs(filter); // Fetch all medals
      })
    );

    // Use allMedals$ and apply search filtering if needed
    this.medals$ = combineLatest([this.allMedals$, this.page$]).pipe(
      switchMap(([medals, page]) => {
            // Apply the search filter across all medals
            let filteredMedals = medals;

            if (this.searchQuery) {
              filteredMedals = {
                ...medals,
                data: medals.data.filter((medal) =>
                  medal.name.toLowerCase().includes(this.searchQuery.toLowerCase())
                ),
              };
            }

            // Return the filtered medals as an observable
            return of(filteredMedals);
          })
      );

  }

  ngOnInit(): void {}

  onSearchChange() {
    // Trigger a re-evaluation of the medals whenever the search query changes
    this.page$.next(1); // Reset the page to 1 when the search query changes
  }

  applyMedalUpdates(
    medals: Paginated<MedalDef>,
    update: MedalListUpdate
  ): Paginated<MedalDef> {
    switch (update.operation) {
      case "create":
        return {
          data: [...medals.data, update.medal],
          meta: {
            pagination: {
              total: medals.meta.pagination.total + 1,
              start: medals.meta.pagination.start,
              limit: medals.meta.pagination.limit + 1,
            },
          },
        };
      case "update":
        return {
          data: medals.data.map((medal) => {
            if (medal.name == update.medal.name) {
              return update.medal;
            }
            return medal;
          }),
          meta: medals.meta,
        };
      case "delete":
        return {
          data: medals.data.filter((medal) => medal.name != update.medal.name),
          meta: {
            pagination: {
              total: medals.meta.pagination.total - 1,
              start: medals.meta.pagination.start,
              limit: medals.meta.pagination.limit - 1,
            },
          },
        };
    }
  }

  formSubmit({
    medal,
    operation,
  }: {
    medal: MedalDef;
    operation: "create" | "update";
  }) {
    if (operation == "create") {
      this.createMedal(medal);
    }
    if (operation == "update") {
      this.updateMedal(medal);
    }
    this.manageForm$.next({ medal: null, show: false, type: "create" });
  }

  updateMedal(medal: MedalDef) {
    this.medalsDefService.updateMedalDef(medal).subscribe(
      ({ data }: any) => {
        this.toastr.success(
          `Medal ${medal.name} successfully updated`,
          "Medal Update Successful"
        );
        this.updateMedal$.next({
          medal: new MedalDef().deserialize(data),
          operation: "update",
        });
      },
      (error) => {
        console.error(error);
        this.toastr.error(
          `An error occurred while updating the Medal ${medal.name}`,
          "Medal Update Failed"
        );
      }
    );
  }

  createMedal(medal: MedalDef) {
    this.medalsDefService.createMedalDef(medal).subscribe(
      ({ data }: any) => {
        this.toastr.success(
          `Medal ${medal.name} successfully created`,
          "Medal Creation Successful"
        );
        this.updateMedal$.next({
          medal: new MedalDef().deserialize(data),
          operation: "create",
        });
      },
      (error) => {
        console.error(error);
        this.toastr.error(
          `An error occurred while creating the Medal ${medal.name}`,
          "Medal Creation Failed"
        );
      }
    );
  }

  delete_medal(medal) {
    this.medalsDefService.deleteMedal(medal).subscribe(
      (response) => {
        if (response["data"]) {
          this.toastr.success(
            `medal ${medal.name} successfully deleted`,
            "Medal Deletion Successful"
          );
          this.updateMedal$.next({
            medal,
            operation: "delete",
          });
        }
      },
      (error) => {
        this.toastr.error(
          `An error occurred while deleting the medal ${medal.name}`,
          "Medal Delete Failed"
        );
      }
    );
  }

  open_create_form(resource_id: string) {
    this.manageForm$.next({
      medal: new MedalDef().deserialize({ resource_id }),
      show: true,
      type: "create",
    });
  }

  open_edit_form(medalDef: MedalDef) {
    this.manageForm$.next({
      medal: medalDef,
      show: true,
      type: "update",
    });
  }
}
