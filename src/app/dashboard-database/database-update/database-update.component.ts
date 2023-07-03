import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { map, pluck, shareReplay, switchMap, tap } from 'rxjs/operators';
import { toFormData } from '../../directives/toFormData';
import { DatabasesService } from '../../databases/services/databases.service';

@Component({
  selector: 'database-update',
  templateUrl: './database-update.component.html',
  styleUrls: ['./database-update.component.scss'],
  host: {
    class: 'tw-flex-auto'
  }
})
export class DatabaseUpdateComponent implements OnInit {
  resource_id$: Observable<string>;
  resource$: Observable<Object>;
  resource_data$: Observable<Object>;
  form: any;

  constructor(
    protected route: ActivatedRoute,
    private formBuilder: FormBuilder,
    protected databaseService: DatabasesService,
    protected toaster: ToastrService
  ) {
    this.resource_id$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("resource_id");
      })
    );

    this.resource_data$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource(resource_id);
      }),
      shareReplay()
    );
    
    this.resource$ = this.resource_data$.pipe(pluck("data"));

    this.resource$.subscribe((resource: any) => {
      this.form = this.formBuilder.group(
        {
          resource_uri: [
            resource.resource_uri,
            [
              Validators.required,
              // validate that the field is a URL
              Validators.pattern(
                /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
              ),
            ],
          ],
          resource_description: [
            resource.resource_description,
            [Validators.required],
          ],
          resource_id: [resource.resource_id, [Validators.required]],
          resource_long_name: [
            resource.resource_long_name,
            [Validators.required],
          ],
          resource_name: [resource.resource_name, [Validators.required]],
          resource_url: [
            resource.resource_url,
            [
              Validators.required,
              // validate that the field is a URL
              Validators.pattern(
                /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
              ),
            ],
          ],
          logo: [null],
        },
        { validators: Validators.required, updateOn: "change" }
      );
    });
  }

  ngOnInit(): void {}

  submit() {
    const formValue = toFormData(this.form.value);

    this.databaseService.update_resource(formValue).subscribe(
      (response: any) => {
        this.toaster.success(
          response.data.resource_name + " updated successfullly",
          "Success"
        );
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

  onFileSelected(event){
    const file:File = event.target.files[0]
    this.form.controls['logo'].setValue(file)
  }

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
