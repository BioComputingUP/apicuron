import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import {
  catchError,
  finalize,
  switchMap,
  takeUntil,
  tap,
} from "rxjs/operators";
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
export class SubmitBulkComponent implements OnInit, OnDestroy {
  form: any;

  destroy$ = new Subject<Boolean>();

  blockUI$ = new BehaviorSubject<Boolean>(false);

  constructor(
    private formBuilder: FormBuilder,
    private dashboardService: DashboardService,
    private messageService: ToastrService
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  @Input("resource")
  resource: Resource;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      reports: [null, [Validators.required]],
      "delete-all": [false, []],
    });
  }

  submit() {
    const formData = new FormData();
    formData.append("reports", this.reports.value);
    if (this.delete_all.value) {
      const res_id: string = this.resource.resource_id;
      formData.append("delete_all[]", res_id);
    }

    this.blockUI$.next(true);

    this.dashboardService
      .submit_reports_bulk(formData)
      .pipe(
        catchError(({ error }, caught) => {
          if (error.message && error.statusCode == 400) {
            let errors = Array.isArray(error.message)
              ? error.message.join("\n")
              : error.message;
            this.messageService.warning(errors, "Validation Error");
          } else {
            this.messageService.error(
              "An error occured while sending the form, please contact the developers",
              "Error"
            );
          }

          throw new Error("Submission Failed");
        }),
        tap(() => {
          this.messageService.info(
            "you will receive a submission report in your notifications soon.",
            "Reports submitted"
          );
          this.blockUI$.next(false);
        }),
        takeUntil(this.destroy$)
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
