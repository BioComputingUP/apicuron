import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { catchError, finalize, switchMap, tap } from "rxjs/operators";
import { DashboardService } from "../../services/dashboard.service";
import { Resource } from "src/app/models/resource.model";
import { MessageService } from "primeng/api";

@Component({
  selector: "submit-bulk",
  templateUrl: "./submit-bulk.component.html",
  styleUrls: [
    "./submit-bulk.component.scss",
    "../submit-report.component.scss",
  ],
})
export class SubmitBulkComponent implements OnInit {
  form: any;

  blocked: Boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private dashboardService: DashboardService,
    private messageService: MessageService
  ) {}

  @Input("resource")
  resource: Resource;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      reports: [null, [Validators.required]],
      "delete-all": [[], []],
    });
  }

  submit() {
    const formData = new FormData();
    formData.append("reports", this.reports.value);
    if (this.delete_all) {
      const res_id: string = this.resource.resource_id;
      formData.append("delete_all[]", res_id);
    }

    this.blocked = true;

    this.dashboardService
      .submit_reports_bulk(formData)
      .pipe(
        catchError(({ error }, caught) => {
          if (error.message && error.statusCode == 400) {
            let errors = Array.isArray(error.message)
              ? error.message.join("\n")
              : error.message;
            this.messageService.add({
              severity: "warn",
              detail: errors,
              summary: "Validation Error",
            });
          } else {
            this.messageService.add({
              severity: "error",
              detail:
                "An error occured while sending the form, please contact the developers",
              summary: "Error",
            });
          }

          throw new Error("Submission Failed");
        }),
        tap(() => {
          this.messageService.add({
            severity: "success",
            detail:
              "you will receive a submission report in your notifications soon.",
            summary: "Reports submitted",
          });
        }),
        finalize(() => {
          this.blocked = false;
        })
      )
      .subscribe(() => {});
  }
  onFileSelected(event) {
    const file: File = event.target.files[0];
    this.form.controls["reports"].setValue(file);
  }

  get reports(): FormControl {
    return this.form.get("reports");
  }

  get delete_all(): FormControl {
    return this.form.get("delete-all");
  }
}
