import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, Observable, Subject, combineLatest, of } from "rxjs";
import { map, switchMap, shareReplay, startWith, scan } from "rxjs/operators";
import { ResourcesService } from "../../resource/service/resources.service";
import { Resource } from "../../models/resource.model";
import { TermsService } from "../../terms/services/terms.service";
import { Term } from "../../models/term.model";
import { MedalDefService } from "../../achievements-def/services/medal-def.service";
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
  resourceId$: Observable<string>;
  resource$: Observable<Resource>;
  terms$: Observable<any>;
  maxDate = new Date();
  limit = 15;
  searchQuery$ = new BehaviorSubject<string>("");
  searchInput = new BehaviorSubject<string>("");

  medals$: Observable<Paginated<MedalDef>>;
  mergedMedals$: Observable<Paginated<MedalDef>>;
  updateMedal$ = new Subject<MedalListUpdate>();

  manageForm$ = new Subject<{
    medal: MedalDef;
    show: boolean;
    type: "create" | "update";
  }>();

  page$ = new BehaviorSubject<number>(1);
  medalFilter$: Observable<MedalDefFilter>;
  allMedals$: Observable<Paginated<MedalDef>>;

  constructor(
    protected route: ActivatedRoute,
    protected medalsDefService: MedalDefService,
    protected formBuilder: FormBuilder,
    protected toastr: ToastrService,
    protected termsService: TermsService,
    protected resourceService: ResourcesService
  ) {
    this.resourceId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get("resource_id"))
    );

    this.resource$ = this.resourceId$.pipe(
      switchMap((resource_id: string) =>
        this.resourceService.get_resource(resource_id)
      ),
      shareReplay()
    );

    this.terms$ = this.resource$.pipe(
      switchMap(({ resource_id }) =>
        this.termsService.getTerms({ resource_id })
      ),
      map((terms: Term[]) => this.groupTerms(terms)),
      shareReplay()
    );

    this.medalFilter$ = combineLatest([
      this.resource$,
      this.page$,
      this.searchQuery$,
    ]).pipe(
      map(([{ resource_id }, page, searchQuery]: [Resource, number, string]) =>
        MedalDefFilter.create({
          resource_id,
          skip: (page - 1) * this.limit,
          limit: this.limit,
          search_query: searchQuery,
        })
      )
    );

    this.allMedals$ = this.medalFilter$.pipe(
      switchMap((filter: MedalDefFilter) =>
        this.medalsDefService.getMedalDefs(filter)
      )
    );

    this.mergedMedals$ = this.allMedals$.pipe(
      switchMap((initialMedals) =>
        this.updateMedal$.pipe(
          scan(
            (currentMedals, update) =>
              this.applyMedalUpdates(currentMedals, update),
            initialMedals
          ),
          startWith(initialMedals)
        )
      )
    );

    this.medals$ = this.mergedMedals$;
  }

  private groupTerms(terms: Term[]): any {
    return ["generation", "invalidation", "revision"].map((category) => ({
      label: category,
      value: category,
      items: terms
        .filter((term) => term.category === category)
        .map((term) => ({
          label: term.activity_name,
          value: term.activity_term,
        })),
    }));
  }

  ngOnInit(): void {}

  onSearchClick(): void {
    this.searchQuery$.next(this.searchInput.value);
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
          data: medals.data.map((medal) =>
            medal.name === update.medal.name ? update.medal : medal
          ),
          meta: medals.meta,
        };
      case "delete":
        return {
          data: medals.data.filter((medal) => medal.name !== update.medal.name),
          meta: {
            pagination: {
              total: medals.meta.pagination.total - 1,
              start: medals.meta.pagination.start,
              limit: medals.meta.pagination.limit - 1,
            },
          },
        };
      default:
        return medals;
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

  confirmDeleteMedal(medal: MedalDef) {
    const confirmed = confirm(
      `Are you sure you want to delete the medal ${medal.name}?`
    );
    if (confirmed) {
      this.delete_medal(medal);
    }
  }
  delete_medal(medal: MedalDef) {
    this.medalsDefService.deleteMedal(medal).subscribe(
      (response) => {
        if (response["data"]) {
          this.toastr.success(
            `Medal ${medal.name} successfully deleted`,
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

  onCloseForm() {
    this.manageForm$.next({ medal: null, show: false, type: "create" });
  }
}
