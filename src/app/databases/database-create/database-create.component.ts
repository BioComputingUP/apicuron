import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { combineLatest, Observable, of } from "rxjs";
import { catchError, map, pluck, shareReplay, tap } from "rxjs/operators";
import { toFormData } from "../../directives/toFormData";
import { DatabasesService } from "../services/databases.service";
import { ResourceIdValidator } from "../validators/resource-id.validator";

@Component({
  selector: "app-database-create",
  templateUrl: "./database-create.component.html",
  styleUrls: ["./database-create.component.scss"],
})
export class DatabaseCreateComponent implements OnInit {
  data$: Observable<any>;

  form_response$: Observable<any>;

  JSON = JSON;

  form: FormGroup;
  formData: FormData;
  error_response$: Observable<any>;

  constructor(
    private formBuilder: FormBuilder,
    protected databasesService: DatabasesService
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
        logo: [null, [Validators.required]]
      },
      { validators: Validators.required, updateOn: "change" }
    );

    this.formData = this.form.value
  }

  onFileSelected(event){
    const file:File = event.target.files[0]
    this.form.controls['logo'].setValue(file)
  }


  submit() {
    const formValue = toFormData(this.form.value);

    this.form_response$ = this.databasesService
      .create_resource(formValue)
    
    this.error_response$ = this.form_response$.pipe(
      catchError((err:Error) => of(err.message))
    )
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
}
