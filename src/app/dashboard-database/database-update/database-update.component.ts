import { HttpErrorResponse } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  SecurityContext,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import {
  Observable,
  Subscription,
  combineLatest,
  fromEvent,
  interval,
  merge,
  of,
} from "rxjs";
import {
  catchError,
  finalize,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from "rxjs/operators";
import { ResourcesService } from "../../resource/service/resources.service";
import { Resource } from "../../models/resource.model";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { MessageService } from "primeng/api";

@Component({
  selector: "database-update",
  templateUrl: "./database-update.component.html",
  styleUrls: ["./database-update.component.scss"],
  host: {
    class: "tw-flex-auto",
  },
})
export class DatabaseUpdateComponent {
  resource_id$: Observable<string>;
  resource$: Observable<Object>;
  form: FormGroup;
  fileInputSubscription$: Subscription;
  logoLink$: Observable<SafeUrl | string>;
  blocked: Boolean = false;

  constructor(
    protected route: ActivatedRoute,
    private formBuilder: FormBuilder,
    protected resourceService: ResourcesService,
    private messageService: MessageService,
    protected sanitizer: DomSanitizer
  ) {
    this.resource_id$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("resource_id");
      })
    );

    this.resource$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => {
        return this.resourceService.get_resource(resource_id);
      }),
      shareReplay(),
      tap(async (resource: Resource) => {
        this.form.setValue({
          ...resource.serialize(),
          logo: null,
        });
      })
    );

    this.form = this.formBuilder.group(
      {
        resource_uri: [
          null,
          [
            Validators.required,
            // validate that the field is a URL
            Validators.pattern(
              /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
            ),
          ],
        ],
        resource_description: [null, [Validators.required]],
        resource_id: [null, [Validators.required]],
        resource_long_name: [null, [Validators.required]],
        resource_name: [null, [Validators.required]],
        resource_url: [
          null,
          [
            Validators.required,
            // validate that the field is a URL
            Validators.pattern(
              /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
            ),
          ],
        ],
        logo: [null],
        color: [
          null,
          [
            Validators.required,
            Validators.pattern(
              /(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/
            ),
          ],
        ],
      },
      { validators: Validators.required, updateOn: "change" }
    );

    this.logoLink$ = combineLatest([
      this.resource$,
      this.form.get("logo").valueChanges.pipe(startWith({})),
    ]).pipe(
      map(([resource, changes]: [Resource, File | null]) => {
        if (changes && changes instanceof File) {
          const url = URL.createObjectURL(changes);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
          console.log({ url, safeUrl });
          return safeUrl;
        } else {
          return resource.logo.href;
        }
      })
    );
  }

  submit() {
    const formValue: FormData = this.form.value;
    this.blocked = true;
    this.resourceService
      .updateResource(
        new Resource().deserialize(formValue),
        this.form.get("logo").value
      )
      .pipe(
        catchError(({ error }, caught) => {
          if (error.message && error.statusCode == 400) {
            let errors = Array.isArray(error.message)
              ? error.message.join("\n")
              : error.message;
            this.messageService.add({
              severity: "warn",
              summary: "Validation Error",
              detail: errors,
            });
            throw new Error(error);
          } else {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail:
                "An error occured while sending the form, please contact the developers",
            });
            throw new Error(error);
          }
          // return 'handled'
        }),
        tap(() => {
          this.messageService.add({
            severity: "success",
            summary: "Resource Updated Sucessfully",
            detail: "",
            life: 5000,
          });
        }),
        finalize(() => {
          this.blocked = false;
        })
      )
      .subscribe(() => {});

  }

  async onFileSelected(event: { files: File[] }) {
    console.log({ event });
    const file: File = event.files[0];
    this.form.controls["logo"].setValue(file);
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

  get color() {
    return this.form.get("color");
  }
}
