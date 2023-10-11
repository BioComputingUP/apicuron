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
} from "rxjs";
import { map, shareReplay, startWith, switchMap } from "rxjs/operators";
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

  medals$: Observable<Paginated<MedalDef>>;
  updateMedal$ = new Subject<MedalListUpdate>();

  // Form
  manageForm$ = new BehaviorSubject<{
    medal: MedalDef;
    show: boolean;
    type: "create" | "update";
  }>({ medal: null, show: false, type: "create" });

  // pagination
  page$ = new BehaviorSubject<number>(1);
  medalFilter$: Observable<MedalDefFilter>;
  medalsList$: Observable<Paginated<MedalDef>>;

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

    this.medalsList$ = this.medalFilter$.pipe(
      switchMap((filter: MedalDefFilter) => {
        return this.medalsDefService.getMedalDefs(filter);
      })
    );

    this.medals$ = combineLatest([
      this.medalsList$,
      this.updateMedal$.pipe(startWith(<string>null)),
    ]).pipe(
      map(([medals, update]: [Paginated<MedalDef>, MedalListUpdate]) => {
        if (update != null) {
          if (update.operation == "create") {
            medals.data = [...medals.data, update.medal];
          }
          if (update.operation == "update") {
            const index = medals.data.findIndex(
              ({ name, resource_id }) =>
                name == update.medal.name &&
                update.medal.resource_id == resource_id
            );
            if (index != -1) {
              medals.data[index] = update.medal;
            }
          }
          if (update.operation == "delete") {
            medals.data = medals.data.filter(
              (medal) => medal.name != update.medal.name
            );
          }
        }
        return medals;
      })
    );
  }

  ngOnInit(): void {}

  // private update_medal(medal_update) {
  //   const medals = this.medals$.value;
  //   const update_index = medals.findIndex(
  //     (medal) => medal.name == medal_update.name
  //   );
  //   medals[update_index] = medal_update;
  //   this.medals$.next(medals);
  // }

  // private create_medal(medal) {
  //   const medals = this.medals$.value;
  //   this.medals$.next([medal, ...medals]);
  // }

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
          `Medal ${medal.name} sucessfully updated`,
          "Medal Update Sucessfull"
        );
        this.updateMedal$.next({
          medal: new MedalDef().deserialize(data),
          operation: "update",
        });
      },
      (error) => {
        console.error(error);
        this.toastr.error(
          `An error occured while updating the Medal ${medal.name}`,
          "Medal Update Failed"
        );
      }
    );
  }
  createMedal(medal: MedalDef) {
    this.medalsDefService.createMedalDef(medal).subscribe(
      ({ data }: any) => {
        this.toastr.success(
          `Medal ${medal.name} sucessfully created`,
          "Medal Creation Sucessfull"
        );
        this.updateMedal$.next({
          medal: new MedalDef().deserialize(data),
          operation: "create",
        });
      },
      (error) => {
        console.error(error);
        this.toastr.error(
          `An error occured while creating the Medal ${medal.name}`,
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
            `medal ${medal.name} sucessfully Created`,
            "medal Creation Sucessfull"
          );
          this.updateMedal$.next({
            medal,
            operation: "delete",
          });
        }
      },
      (error) => {
        this.toastr.error(
          `An error occured while updating the medal ${medal.name}`,
          "medal Update Failed"
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
