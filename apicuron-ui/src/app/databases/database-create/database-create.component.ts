import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import * as _ from "lodash";
import { ToastrService } from "ngx-toastr";
import { Observable, of, Subject } from "rxjs";
import { finalize, map, shareReplay, takeUntil, tap } from "rxjs/operators";
import { Resource } from "src/app/models/resource.model";
import { URL_PATTERN } from "src/app/models/types/constants";
import {
  ResourceCategories,
  ResourceCategory,
} from "src/app/models/types/enums";
import { toFormData } from "../../util/toFormData";
import { DatabasesService } from "../services/databases.service";
import { ResourceIdValidator } from "../validators/resource-id.validator";
import { GithubUrlValidator } from "../validators/github-url.validator";

interface ResourceFormGroup {
  resource_uri: FormControl<string>;
  resource_description: FormControl<string>;
  resource_id: FormControl<string>;
  resource_long_name: FormControl<string>;
  resource_name: FormControl<string>;
  color: FormControl<string>;
  resource_url: FormControl<string>;
  logo: FormControl<File | null>;
  category: FormControl<ResourceCategory>;
}

@Component({
  selector: "app-database-create",
  templateUrl: "./database-create.component.html",
  styleUrls: ["./database-create.component.scss"],
})
export class DatabaseCreateComponent implements OnDestroy {
  data$: Observable<Resource[]>;
  isSubmitting = false;
  form: FormGroup<ResourceFormGroup>;
  destroy$ = new Subject<Boolean>();

  readonly ResourceCategories = ResourceCategories;
  constructor(
    private formBuilder: FormBuilder,
    protected databasesService: DatabasesService,
    protected toaster: ToastrService,
  ) {
    this.data$ = this.databasesService.get_resources().pipe(
      takeUntil(this.destroy$),
      map((response) => response.data),
      shareReplay(1),
      tap((data) => {
        const resource_ids = data.map((x) => x.resource_id);

        this.buildForm(resource_ids);
      }),
    );
  }

  buildForm(resource_ids: string[]) {
    this.form = this.formBuilder.group(
      {
        resource_uri: [
          "",
          [
            Validators.required,
            // validate that the field is a URL
            Validators.pattern(URL_PATTERN),
          ],
        ],
        resource_description: ["", [Validators.required]],
        resource_id: [
          "",
          [
            Validators.required,
            ResourceIdValidator.createValidator(resource_ids),
          ],
        ],
        resource_long_name: ["", [Validators.required]],
        resource_name: ["", [Validators.required]],
        color: ["", [Validators.required]],
        resource_url: [
          "",
          [
            Validators.required,
            // validate that the field is a URL
            Validators.pattern(URL_PATTERN),
          ],
        ],
        logo: this.formBuilder.control<File | null>(null, [
          Validators.required,
        ]),
        category: this.formBuilder.control<ResourceCategory>(
          ResourceCategory.Database,
          [Validators.required],
        ),
      },
      {
        updateOn: "change",
        validators: GithubUrlValidator.createValidator([
          ResourceCategory.Software,
        ]),
      },
    );
  }

  onFileSelected(event) {
    const file: File = event.target.files[0];
    this.form.controls["logo"].setValue(file);
  }

  submit() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    const formValue = toFormData(this.form.value);
    console.log(formValue);
    this.databasesService
      .create_resource(formValue)
      .pipe(
        // Ensure to always reset even if error is
        finalize(() => {
          this.isSubmitting = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          this.toaster.success("Resource submitted successfully", "Success");
        },
        error: ({ error }: HttpErrorResponse) => {
          if (error.message && error.statusCode == 400) {
            let errors = Array.isArray(error.message)
              ? error.message.join("\n")
              : error.message;
            this.toaster.warning(errors, "Validation Error");
          } else {
            this.toaster.error(
              "An error occured while sending the form, please contact the developers",
              "Error",
            );
          }
          return of(error.message);
        },
      });
  }

  passData($event: any) {
    if ($event.loading || $event.error || !$event.data) {
      return;
    }
    if (!this.form) {
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
  get resource_uri() {
    return this.form.controls.resource_uri;
  }

  get resource_description() {
    return this.form.controls.resource_description;
  }

  get resource_id() {
    return this.form.controls.resource_id;
  }

  get resource_long_name() {
    return this.form.controls.resource_long_name;
  }

  get resource_name() {
    return this.form.controls.resource_name;
  }

  get resource_url() {
    return this.form.controls.resource_url;
  }

  get color() {
    return this.form.controls.color;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
