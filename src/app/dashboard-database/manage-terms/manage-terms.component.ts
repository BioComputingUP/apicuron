import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, combineLatest, Observable, Subject, tap } from "rxjs";
import {
  distinctUntilChanged,
  map,
  pluck,
  shareReplay,
  switchMap,
  takeUntil,
} from "rxjs/operators";
import { DatabasesService } from "../../databases/services/databases.service";
import {
  UpdateTerm,
  TermsService,
  CreateTerm,
  DeleteTerm,
} from "../services/terms.service";
import { Term } from "src/app/models/term.model";
import { Resource } from "src/app/models/resource.model";
import { ActivityCategory } from "src/app/util/types";
@Component({
  selector: "app-manage-terms",
  templateUrl: "./manage-terms.component.html",
  styleUrls: ["./manage-terms.component.scss"],
  host: {
    class: "tw-flex-auto",
  },
})
export class ManageTermsComponent implements OnInit, OnDestroy {
  // main properties
  allTerms$: Observable<Array<any>>;
  resource$: Observable<Resource>;
  resource_id: string;
  // Filtering related properties
  searchTerm$ = new BehaviorSubject<string>("");
  searchTerm: string = "";
  filteredTerms$: Observable<Array<any>>;
  // form control
  show_form: "update" | "create" | false = false;
  form: FormGroup;
  activity_categories = Object.values(ActivityCategory);
  termsChanged$ = new BehaviorSubject<boolean>(false); // trigger this when the terms list update to refresh from the database

  destroy$ = new Subject<void>();
  constructor(
    protected route: ActivatedRoute,
    protected databaseService: DatabasesService,
    protected formBuilder: FormBuilder,
    protected toast: ToastrService,
    protected termsService: TermsService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit(): void {
    this.resource$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get("resource_id")),
      tap((resource_id) => {
        this.resource_id = resource_id;
      }),
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource(resource_id);
      }),
      map((response) => response.data),
      shareReplay(),
      takeUntil(this.destroy$)
    );

    this.allTerms$ = combineLatest([this.resource$, this.termsChanged$]).pipe(
      switchMap(([resource]) =>
        this.termsService.get_resource_terms(resource.resource_id)
      ),
      map((response) => response.data), // instead of pluck since it's now deperacted
      takeUntil(this.destroy$),
      shareReplay(1)
    );

    this.filteredTerms$ = combineLatest([
      this.searchTerm$,
      this.allTerms$,
    ]).pipe(
      map(([searchTerm, terms]) => {
        if (!searchTerm) {
          return terms;
        }
        const searchTermLower = searchTerm.toLowerCase();
        return terms.filter(
          (term) =>
            term.activity_term.toLowerCase().includes(searchTermLower) ||
            term.activity_name.toLowerCase().includes(searchTermLower) ||
            term.activity_category.toLowerCase().includes(searchTermLower) ||
            term.description.toLowerCase().includes(searchTermLower)
        );
      }),
      takeUntil(this.destroy$)
    );
  }
  onSearchTermChange(searchTerm: string) {
    this.searchTerm$.next(searchTerm);
  }

  open_edit_term_modal(term) {
    this.form = this.formBuilder.group({
      resource_id: [term.resource_id, [Validators.required]],
      activity_term: [term.activity_term, [Validators.required]],
      activity_category: [term.activity_category, [Validators.required]],
      activity_name: [term.activity_name, [Validators.required]],
      score: [term.score, [Validators.required, Validators.min(1)]],
      description: [term.description, [Validators.required]],
    });
    this.show_form = "update";
  }

  open_create_term() {
    // this.form.reset();
    this.form = this.formBuilder.group({
      resource_id: [this.resource_id, [Validators.required]],
      activity_term: ["", [Validators.required]],
      activity_category: [ActivityCategory.generation, [Validators.required]],
      activity_name: ["", [Validators.required]],
      score: ["", [Validators.required, Validators.min(1)]],
      description: ["", [Validators.required]],
    });
    this.show_form = "create";
  }

  submit_form() {
    if (this.form.valid) {
      if (this.show_form === "create") {
        const term: CreateTerm = this.form.value;
        this.termsService.create_term(term).subscribe(
          ({ data }: { data: CreateTerm }) => {
            this.toast.success("Term Successfully Created");
            this.termsChanged$.next(true);
            this.show_form = false;
          },
          (err) => this.handleError(err)
        );
      } else if (this.show_form === "update") {
        const term: UpdateTerm = this.form.value;
        this.termsService.update_term(term).subscribe(
          ({ data }: { data: CreateTerm }) => {
            this.toast.success("Term Successfully Updated");
            this.termsChanged$.next(true);
            this.show_form = false;
          },
          (err) => this.handleError(err)
        );
      }
    }else{
      this.form.markAllAsTouched();
    }
  }

  handleError(error) {
    if (error.error && error.error.message && error.error.statusCode === 400) {
      let errors = Array.isArray(error.error.message)
        ? error.error.message.join("\n")
        : error.error.message;
      this.toast.warning(errors, "Validation Error");
    } else {
      this.toast.error(
        "An error occurred. Please contact the developers.",
        "Error"
      );
    }
  }

  confirmDelete(term: any) {
    const confirmed = confirm(
      `Are you sure you want to delete ${term.activity_name}?`
    );
    if (confirmed) {
      this.delete_term(term);
    }
  }

  delete_term(term: DeleteTerm) {
    this.termsService.delete_term(term).subscribe(
      () => {
        this.toast.success(`Term ${term.activity_term} Successfully Deleted`);
        this.termsChanged$.next(true);
      },
      (error) => this.handleError(error)
    );
  }
}
