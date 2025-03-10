import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { combineLatest, EMPTY, Observable, of, Subject } from "rxjs";
import {
  catchError,
  concatMap,
  map,
  pluck,
  shareReplay,
  startWith,
  switchMap,
  switchScan,
  take,
  tap,
} from "rxjs/operators";
import { DatabasesService } from "../../databases/services/databases.service";
import {
  UpdateTerm,
  TermsService,
  CreateTerm,
  DeleteTerm,
} from "../services/terms.service";
import { Term } from "../../models/term.model";
import { Resource } from "../../models/resource.model";

type FormCommand =
  | {
      type: "create" | "closed";
    }
  | {
      type: "update";
      term: Term;
    };
type FormState = { value: "closed" } | FormOperationState;

type FormOperationState = { value: "create" | "update"; form: FormGroup };

type TermListCommand =
  | {
      type: "update" | "create";
      term: Term;
    }
  | {
      type: "delete";
      term: Term;
    }
  | { type: "filter"; query: string };
@Component({
  selector: "app-manage-terms",
  templateUrl: "./manage-terms.component.html",
  styleUrls: ["./manage-terms.component.scss"],
  host: {
    class: "tw-flex-auto",
  },
})
export class ManageTermsComponent implements OnInit {
  resourceId$: Observable<string>;
  resource$: Observable<Object>;
  terms$: Observable<Term[]>;
  termsList$: Observable<Array<any>>; // Observable for filtered terms
  activity_categories = ["generation", "invalidation", "revision"];
  searchQuery = new Subject<string>();
  openForm$ = new Subject<FormCommand>();
  formState$: Observable<FormState>;
  termsListUpdateEvents$ = new Subject<TermListCommand>();

  constructor(
    protected route: ActivatedRoute,
    protected databaseService: DatabasesService,
    protected formBuilder: FormBuilder,
    protected toast: ToastrService,
    protected termsService: TermsService
  ) {}

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
    this.terms$ = this.resourceId$.pipe(
      switchMap((resource_id: string) =>
        this.termsService.get_resource_terms(resource_id)
      ),
      shareReplay()
    );
    // Get terms from the service when resourceId changes

    this.setupTermsList();

    this.formState$ = combineLatest([this.openForm$, this.resource$]).pipe(
      startWith("closed"),
      map(([openFormCommand, resource]: [FormCommand, Resource]) => {
        if (openFormCommand.type === "closed") {
          return { value: "closed" };
        }
        if (openFormCommand.type === "create") {
          const form = Term.createForm(this.formBuilder, resource.resource_id);
          return { value: "create", form };
        }
        if (openFormCommand.type === "update") {
          const form = openFormCommand.term.getUpdateForm(this.formBuilder);
          return { value: "update", form };
        }
      })
    );
  }

  closeForm() {
    this.openForm$.next({ type: "closed" });
  }

  search($event: Event) {
    this.searchQuery.next(($event.target as HTMLInputElement).value);
    this.termsListUpdateEvents$.next({
      type: "filter",
      query: ($event.target as HTMLInputElement).value,
    });
  }

  // Apply search filter to terms
  setupTermsList() {
    // Initialize the termsList$ with the initial list
    this.termsList$ = this.terms$.pipe(
      // ConcatMap to listen to the termsListUpdateEvents$ and update the list
      concatMap((terms) =>
        // This function should return an observable that emits the updated list
        this.termsListUpdateEvents$.pipe(
          // in the initial state there are no updates to the list, we start with a nullish value to get the first emission
          startWith(null),
          // switchScan is an accumulator that takes the accumulated list and the event and returns the updated list
          switchScan((accumulatedList: Term[], command: TermListCommand) => {
            if (!command) {
              return of(terms);
            }

            if (command.type === "create") {
              // in here we return the observable that emits the updated list
              // While making the API call effectively removing the need to subscribe to the observable
              return this.termsService.create_term(command.term).pipe(
                catchError(this.handleError.bind(this)),
                tap(() => {
                  this.toast.success(
                    `Term ${command.term.name} Successfully Created`
                  );
                  accumulatedList.unshift(command.term);
                  this.closeForm();
                }),
                map(() => accumulatedList)
              );
            }
            if (command.type === "update") {
              const updatedList = accumulatedList.map((term) => {
                if (term.activity_term === command.term.activity_term) {
                  return command.term;
                }
                return term;
              });
              return this.termsService.update_term(command.term).pipe(
                catchError(this.handleError),
                tap(() => {
                  this.toast.success(
                    `Term ${command.term.name} Successfully Created`
                  );
                  this.closeForm();
                }),
                map(() => updatedList)
              );
            }
            if (command.type === "delete") {
              return this.termsService.delete_term(command.term).pipe(
                catchError(this.handleError),
                tap(() =>
                  this.toast.success(
                    `Term ${command.term.name} Successfully Deleted`
                  )
                ),
                map(() =>
                  accumulatedList.filter(
                    (term) => term.activity_term != command.term.activity_term
                  )
                )
              );
            }
            if (command.type === "filter") {
              const filtered = terms.filter(
                (term) =>
                  term.activity_term.toLowerCase().includes(command.query) ||
                  term.activity_name.toLowerCase().includes(command.query) ||
                  term.category.toLowerCase().includes(command.query) ||
                  term.description.toLowerCase().includes(command.query)
              );
              return of(filtered);
            }
          }, terms)
        )
      )
    );
  }

  open_edit_term_modal(term: Term) {
    this.openForm$.next({ type: "update", term });
  }

  open_create_term() {
    this.openForm$.next({ type: "create" });
  }

  submit_form(formState: FormOperationState) {
    if (!formState.form.valid) {
      return;
    }
    if (formState.value === "create") {
      const term: CreateTerm = formState.form.value;
      this.termsListUpdateEvents$.next({
        type: "create",
        term: new Term().deserialize(term),
      });
    } else if (formState.value === "update") {
      const term: UpdateTerm = formState.form.value;
      this.termsListUpdateEvents$.next({
        type: "update",
        term: new Term().deserialize(term),
      });
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
    return EMPTY;
  }
  confirmDelete(term: any) {
    const confirmed = confirm(
      `Are you sure you want to delete ${term.activity_name}?`
    );
    if (confirmed) {
      this.termsListUpdateEvents$.next({ type: "delete", term });
    }
  }

  delete_term(term: DeleteTerm) {
    this.termsService
      .delete_term(term)
      .pipe(take(1), catchError(this.handleError))
      .subscribe(() => {
        this.toast.success(`Term ${term.activity_term} Successfully Deleted`);
      });
  }
}
