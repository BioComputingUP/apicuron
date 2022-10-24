import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { DatabasesService } from "../../databases/services/databases.service";
import { UpdateTerm, TermsService, CreateTerm } from "../services/terms.service";

@Component({
  selector: "app-manage-terms",
  templateUrl: "./manage-terms.component.html",
  styleUrls: ["./manage-terms.component.scss"],
})
export class ManageTermsComponent implements OnInit {
  resourceId$: Observable<string>;
  resource$: Observable<Object>;
  terms$: Observable<Array<any>>;
  show_form: "update" | "create" | false = false;
  form: FormGroup;
  activity_categories = ['generation', 'invalidation', 'revision']

  constructor(
    protected route: ActivatedRoute,
    protected databaseService: DatabasesService,
    protected formBuilder: FormBuilder,
    protected toast: ToastrService,
    protected termsService: TermsService
  ) {
    this.resourceId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("resource_id");
      })
    );

    this.resource$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource_details(resource_id);
      }),
      shareReplay(),
      pluck("data")
    );

    this.terms$ = this.resource$.pipe(pluck("terms"));
  }

  ngOnInit(): void {}

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
    this.resourceId$.subscribe((resource_id: string) => {
      this.form = this.formBuilder.group({
        resource_id: [resource_id, [Validators.required]],
        activity_term: ["", [Validators.required]],
        activity_category: ["generation", [Validators.required]],
        activity_name: ["", [Validators.required]],
        score: ["", [Validators.required, Validators.min(1)]],
        description: ["", [Validators.required]],
      });
    });

    this.show_form = "create";
  }

  submit_form() {
    if (this.form.valid) {
      if (this.show_form == "create") {
        const term: CreateTerm = this.form.value

        this.termsService.create_term(term).subscribe(
          (response) => {
            this.toast.success("Term Sucessfully Created");
          },
          (err) => {
            if (err.error && err.error.message && err.error.statusCode == 400) {
              let errors = Array.isArray(err.error.message)
                ? err.error.message.join("\n")
                : err.error.message;
              this.toast.warning(errors, "Validation Error");
            } else {
              this.toast.error(
                "An error occured while sending the form, please contact the developers",
                "Error"
              );
            }
          }
        );
      }
      if (this.show_form == "update") {
        const term: UpdateTerm = this.form.value;

        this.termsService.update_term(term).subscribe(
          (response) => {
            this.toast.success("Term Sucessfully Updated");
          },
          (error) => {
            if (error.message && error.statusCode == 400) {
              let errors = Array.isArray(error.message)
                ? error.message.join("\n")
                : error.message;
              this.toast.warning(errors, "Validation Error");
            } else {
              this.toast.error(
                "An error occured while sending the form, please contact the developers",
                "Error"
              );
            }
          }
        );
      }
    }
  }

  delete_term({ activity_term }) {
    console.log("Delete term");
    console.log({ activity_term });
  }
}
