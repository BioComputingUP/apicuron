import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Observable, Subject, of } from "rxjs";
import { pluck, shareReplay, takeUntil, tap } from "rxjs/operators";
import { toFormData } from "../../util/toFormData";
import { DatabasesService } from "../services/databases.service";
import { ResourceIdValidator } from "../validators/resource-id.validator";
import * as _ from "lodash";

@Component({
  selector: "app-database-create",
  templateUrl: "./database-create.component.html",
  styleUrls: ["./database-create.component.scss"],
})
export class DatabaseCreateComponent implements OnInit, OnDestroy {
  data$: Observable<any>;
  clicked = false;

  JSON = JSON;

  form: FormGroup;
  destroy$ = new Subject<Boolean>();

  constructor(
    private formBuilder: FormBuilder,
    protected databasesService: DatabasesService,
    protected toaster: ToastrService
  ) {
    this.data$ = this.databasesService.get_resources().pipe(
      pluck("data"),
      shareReplay(1),
      tap((data) => {
        const resource_ids = data.map((x) => x.resource_id);
        this.form.controls["resource_id"].addValidators([
          ResourceIdValidator.createValidator(resource_ids),
        ]);
        this.form.get("resource_id").updateValueAndValidity({ onlySelf: true });
      })
    );

    this.form = this.formBuilder.group(
      {
        resource_uri: [
          "",
          [
            Validators.required,
            // validate that the field is a URL
            Validators.pattern(
              /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
            ),
          ],
        ],
        resource_description: ["", [Validators.required]],
        resource_id: ["", [Validators.required]],
        resource_long_name: ["", [Validators.required]],
        resource_name: ["", [Validators.required]],
        color: ["", [Validators.required]],
        resource_url: [
          "",
          [
            Validators.required,
            // validate that the field is a URL
            Validators.pattern(
              /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
            ),
          ],
        ],
        logo: [null, [Validators.required]],
      },
      { validators: Validators.required, updateOn: "change" }
    );
  }

  onFileSelected(event) {
    const file: File = event.target.files[0];
    this.form.controls["logo"].setValue(file);
  }

  submit() {
    const formValue = toFormData(this.form.value);
    this.databasesService.create_resource(formValue).subscribe(
      (response) => {
        this.toaster.success("Resource submitted successfullly", "Success");
      },
      ({ error }: HttpErrorResponse) => {
        if (error.message && error.statusCode == 400) {
          let errors = Array.isArray(error.message)
            ? error.message.join("\n")
            : error.message;
          this.toaster.warning(errors, "Validation Error");
        } else {
          this.toaster.error(
            "An error occured while sending the form, please contact the developers",
            "Error"
          );
        }
        return of(error.message);
      }
    );
  }

  slugifyId(str: string) {
    const slug_str = str.toLowerCase().replace(/\s+/g, "_");
    return slug_str;
  }

  passData($event: any) {
    if ($event.loading || $event.error || !$event.data) {
      return;
    }
    const { name, homepage, description } = $event.data.metadata;
    this.form.patchValue({
      resource_id: _.kebabCase(name) || "",
      resource_name: name || "",
      resource_long_name: name || "",
      resource_url: homepage || "",
      resource_uri: homepage || "",
      resource_description: description || "",
    });
  }

  ngOnInit(): void {}
  get resource_uri() {
    return this.form.get("resource_uri");
  }

  get resource_description() {
    return this.form.get("resource_description");
  }

  get resource_id() {
    return this.form.get("resource_id");
  }

  get resource_long_name() {
    return this.form.get("resource_long_name");
  }

  get resource_name() {
    return this.form.get("resource_name");
  }

  get resource_url() {
    return this.form.get("resource_url");
  }

  get color() {
    return this.form.get("color");
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
