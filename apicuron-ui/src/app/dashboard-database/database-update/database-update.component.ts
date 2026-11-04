import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MessageService } from "primeng/api";
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import {
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
  resource$: Observable<Resource>;

  // the open tab is kept in the ?tab= query param, so it can be linked and survives a reload
  readonly tabs = [
    { id: "profile", label: "Profile" },
    { id: "leaderboards", label: "Leaderboards" },
    { id: "allowed-hosts", label: "Allowed hosts" },
  ];
  tab$: Observable<string>;

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
    this.tab$ = this.route.queryParamMap.pipe(
      map((params: ParamMap) => {
        const tab = params.get("tab");
        return this.tabs.some(({ id }) => id == tab) ? tab : "profile";
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.blocked$.next(false);
          this.form.markAsPristine();
          this.messageService.add({
            severity: "success",
            summary: "Resource Updated Sucessfully",
            detail: "",
            life: 5000,
          });
        },
        error: ({ status, error }) => {
          this.blocked$.next(false);
          const message = Array.isArray(error?.message)
            ? error.message.join("\n")
            : error?.message;
          if (message && status == 400) {
            this.messageService.add({
              severity: "warn",
              summary: "Validation Error",
              detail: message,
            });
          } else {
            const reference = error?.request_id
              ? ` (reference ${error.request_id})`
              : "";
            this.messageService.add({
              severity: "error",
              summary: "The resource was not updated",
              detail:
                (message ?? "An error occured while sending the form") +
                reference,
            });
          }
        },
      });
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
