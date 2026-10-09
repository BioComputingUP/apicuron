import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MessageService } from "primeng/api";
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import {
  catchError,
  map,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap
} from "rxjs/operators";
import { Resource } from "../../models/resource.model";
import {
  ResourceCategories,
  ResourceCategoryLabels,
} from "../../models/types/enums";
import { ResourcesService } from "../../resource/service/resources.service";

@Component({
  selector: "database-update",
  templateUrl: "./database-update.component.html",
  styleUrls: ["./database-update.component.scss"],
  host: {
    class: "tw-flex-auto",
  },
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabaseUpdateComponent implements OnDestroy {
  resource_id$: Observable<string>;
  resource$: Observable<Object>;

  JSON = JSON;

  readonly ResourceCategories = ResourceCategories;
  readonly ResourceCategoryLabels = ResourceCategoryLabels;

  form: FormGroup;

  logoLink$: Observable<SafeUrl | string>;

  blocked$ = new BehaviorSubject<Boolean>(false);
  destroy$ = new Subject<Boolean>();
  leaderboardForm = this.formBuilder.group({
    monthly: [[], []],
    weekly: [[], []],
    total: [[], []],
  });
  // @ViewChild("fileUploadElement", { static: false })
  // fileInputElement: ElementRef<HTMLInputElement>;

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
        category: [null, [Validators.required]],
        leaderboard_preferences: this.leaderboardForm,
      },
      { validators: Validators.required, updateOn: "change" }
    );
    this.resource$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => {
        return this.resourceService.get_resource(resource_id);
      }),
      shareReplay(),
      tap(async (resource: Resource) => {
        // const leaderBoardPrefs = this.parseLeaderBoardPreferences(
        //   resource.leaderboard_preferences
        // );
        this.form.setValue({
          ...resource.serialize(),
          logo: null,
        });
      })
    );

    this.logoLink$ = combineLatest([
      this.resource$,
      this.form.get("logo").valueChanges.pipe(startWith({})),
    ]).pipe(
      map(([resource, changes]: [Resource, File | null]) => {
        if (changes && changes instanceof File) {
          const url = URL.createObjectURL(changes);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url);

          return safeUrl;
        } else {
          return resource.logo.href;
        }
      })
    );
  }

  // selectFile() {
  //   this.fileInputElement.nativeElement.click();
  // }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  submit() {
    const formValue = this.form.value;

    this.blocked$.next(true);
    const resourceData = {
      ...formValue,
      logo: undefined,
    };
    this.resourceService
      .updateResource(
        new Resource().deserialize(resourceData),
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
          this.blocked$.next(false);
          this.messageService.add({
            severity: "success",
            summary: "Resource Updated Sucessfully",
            detail: "",
            life: 5000,
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {});
  }

  async onFileSelected(event) {
    if (event.currentTarget) {
      const fileInput: HTMLInputElement = event.currentTarget;
      if (fileInput.files.length > 0) {
        this.form.get("logo").setValue(fileInput.files[0]);
        this.form.get("logo").markAsDirty();
      }
    }
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
