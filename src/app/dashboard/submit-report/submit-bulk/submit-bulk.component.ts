import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { DashboardService } from "../../services/dashboard.service";

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

  constructor(private formBuilder: FormBuilder, private dashboardService: DashboardService, private toast: ToastrService) {}

  @Input("resource")
  resource$: Observable<any>;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      reports: [null, [Validators.required]],
    });
  }

  submit() {
    console.log(this.form);
    const formData = new FormData();
    formData.append('reports', this.reports.value)

    this.dashboardService.submit_reports_bulk(formData).subscribe(
      (response) => {
        this.toast.success('you will receive a submission report in your notifications soon.','Reports submitted')
      },
      (error) => {
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
      }
    )
  }
  onFileSelected(event) {
    const file: File = event.target.files[0];
    this.form.controls["reports"].setValue(file);
  }

  get reports(): FormControl{
    return this.form.get('reports')
  }
}
