import { Component, Input, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { map, pluck, switchMap } from "rxjs/operators";
import { DatabasesService } from "../../../databases/services/databases.service";
import { DashboardService } from "../../services/dashboard.service";
import { TermsService } from "../../services/terms.service";
import { dateTimeValidator } from "../validators/date-time.validator";
import { orcidIdValidator } from "../validators/orcid-id.validator";
import { Report } from "../../../models/report.model";
import { Term } from "../../../models/term.model";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "submit-single",
  templateUrl: "./submit-single.component.html",
  styleUrls: [
    "./submit-single.component.scss",
    "../submit-report.component.scss",
  ],
})
export class SubmitSingleComponent implements OnInit {
  @Input("resource")
  resource$: Observable<any>;
  form: FormGroup;
  terms$: Observable<Term[]>;

  constructor(
    private formBuilder: FormBuilder,
    private toast: ToastrService,
    private dashboardService: DashboardService,
    private termsService: TermsService
  ) {
    this.form = this.formBuilder.group(
      {
        activity_term: ["", [Validators.required]],
        curator_orcid: [
          "",
          [
            Validators.required,
            Validators.pattern(
              /[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}([0-9]|X)/gm
            ),
            orcidIdValidator(),
          ],
        ],
        entity_uri: [
          "",
          [
            Validators.required,
            Validators.pattern(
              /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
            ),
          ],
        ],
        date: ["", [Validators.required]],
        time: ["", [Validators.required]],
      },
      { validators: [dateTimeValidator()] }
    );
  }

  ngOnInit(): void {
    this.terms$ = this.resource$.pipe(
      switchMap((resource) => {
        return this.termsService.get_resource_terms(resource.resource_id);
      })
    );
  }
  submit() {
    // const data = {
    //   resource_uri = ''
    // }
    this.resource$
      .pipe(
        switchMap(({ resource_id }: { resource_id: string }) => {
          const report = new Report().deserialize({
            resource_id,
            curator_orcid: this.curator_orcid.value,
            entity_uri: this.entity_uri.value,
            timestamp: this.date_time(),
            activity_term: this.activity_term.value,
          });
          return this.dashboardService.submit_report(report);
        })
      )
      .subscribe({
        next: () => {
          this.toast.success("Report Sucessfully Submitted");
        },
        error: (err: HttpErrorResponse) => {
          const { error } = err;
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
        },
      });
  }

  get activity_term(): AbstractControl<string> {
    return this.form.get("activity_term");
  }

  get entity_uri(): AbstractControl<string> {
    return this.form.get("entity_uri");
  }

  get curator_orcid(): AbstractControl<string> {
    return this.form.get("curator_orcid");
  }

  date_time(): Date {
    const date: string = this.form.get("date").value;
    const time = this.form.get("time").value;
    return new Date(`${date} ${time}`);
  }
}
