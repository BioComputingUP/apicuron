import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import {
  map,
  pluck,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from "rxjs/operators";
import { DatabasesService } from "../../databases/services/databases.service";
import {
  UpdateTerm,
  TermsService,
  CreateTerm,
  DeleteTerm,
} from "../services/terms.service";

@Component({
  selector: "app-manage-terms",
  templateUrl: "./manage-terms.component.html",
  styleUrls: ["./manage-terms.component.scss"],
  host: {
    class: "tw-flex-auto",
  },
})
export class ManageTermsComponent implements OnInit, OnDestroy {
  resourceId$: Observable<string>;
  resource$: Observable<Object>;
  terms$ = new BehaviorSubject<Array<any>>([]);
  filteredTerms$: Observable<Array<any>>; // Observable for filtered terms
  show_form: "update" | "create" | false = false;
  form: FormGroup;
  activity_categories = ["generation", "invalidation", "revision"];
  searchTerm: string = ""; // Holds the search term
  openCreateActivity$ = new Subject<void>();
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
  }

  ngOnInit(): void {
    // Retrieve the resourceId from the paramMap
    this.resourceId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get("resource_id"))
    );

    // Retrieve the resource from the API
    this.resource$ = this.resourceId$.pipe(
      switchMap((resource_id: string) =>
        this.databaseService.get_resource(resource_id)
      ),
      shareReplay(),
      pluck("data")
    );

    // Get terms from the service when resourceId changes
    this.resourceId$
      .pipe(
        switchMap((resource_id: string) =>
          this.termsService.get_resource_terms(resource_id)
        ),
        shareReplay(),
        pluck("data"),
        tap((terms: Array<any>) => {
          this.terms$.next(terms);
          this.applySearchFilter();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.openCreateActivity$
      .pipe(
        switchMap(() => this.resourceId$),
        tap((resource_id: string) => {
          this.form = this.formBuilder.group({
            resource_id: ['', [Validators.required]], // Resource ID will be set automatically
            activity_term: ["", [Validators.required]],
            activity_category: ["generation", [Validators.required]],
            activity_name: ["", [Validators.required]],
            score: ["", [Validators.required, Validators.min(1)]],
            description: ["", [Validators.required]],
          });

          this.form.reset(); // Reset the form values when creating a new term
          this.form.get('resource_id').setValue(resource_id);
          this.show_form = "create";
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  // Apply search filter to terms
  applySearchFilter() {
    this.filteredTerms$ = this.terms$.pipe(
      map((terms) => {
        if (!this.searchTerm) {
          return terms; // If searchTerm is empty, show all terms
        }
        const searchTermLower = this.searchTerm.toLowerCase();
        return terms.filter(
          (term) =>
            term.activity_term.toLowerCase().includes(searchTermLower) ||
            term.activity_name.toLowerCase().includes(searchTermLower) ||
            term.activity_category.toLowerCase().includes(searchTermLower) ||
            term.description.toLowerCase().includes(searchTermLower)
        );
      })
    );
  }

  // Update search term and reapply filter
  onSearchTermChange() {
    this.applySearchFilter(); // Reapply the search filter whenever searchTerm changes
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
    this.openCreateActivity$.next();
  }

  submit_form() {
    if (this.form.valid) {
      if (this.show_form === "create") {
        const term: CreateTerm = this.form.value;
        this.termsService.create_term(term).subscribe(
          ({ data }: { data: CreateTerm }) => {
            this.toast.success("Term Successfully Created");
            this.terms$.next(this.terms$.getValue().concat(data));
            this.show_form = false; // Close the form after creation
            this.applySearchFilter(); // Reapply filter after creating a term
          },
          (err) => this.handleError(err)
        );
      } else if (this.show_form === "update") {
        const term: UpdateTerm = this.form.value;
        this.termsService.update_term(term).subscribe(
          ({ data }: { data: CreateTerm }) => {
            this.toast.success("Term Successfully Updated");
            const terms = this.terms$.getValue();
            const updatedIndex = terms.findIndex(
              (term) => data.activity_term === term.activity_term
            );
            if (updatedIndex !== -1) {
              terms[updatedIndex] = data;
              this.terms$.next(terms);
            }
            this.show_form = false; // Close the form after update
            this.applySearchFilter(); // Reapply filter after updating a term
          },
          (err) => this.handleError(err)
        );
      }
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
        const terms = this.terms$
          .getValue()
          .filter((t) => t.activity_term !== term.activity_term);
        this.terms$.next(terms);
        this.applySearchFilter(); // Reapply filter after deleting a term
      },
      (error) => this.handleError(error)
    );
  }
}
