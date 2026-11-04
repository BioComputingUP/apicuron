import { Component, HostListener, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MessageService } from "primeng/api";
import { BehaviorSubject, combineLatest, Observable, of, Subject } from "rxjs";
import { ConfirmationService } from "../../../../projects/apicuron-util/src/lib/confirmation";
import { ConfirmationResponse } from "../../../../projects/apicuron-util/src/lib/confirmation/interfaces/confirmation";
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
  // the values last loaded or saved, restored by discard()
  savedValue: Object;

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
    protected sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService
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
        // the same limits as UpdateResourceDto
        resource_long_name: [
          null,
          [Validators.required, Validators.maxLength(60)],
        ],
        resource_name: [null, [Validators.required, Validators.maxLength(20)]],
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
        this.savedValue = {
          ...resource.serialize(),
          logo: null,
        };
        this.form.setValue(this.savedValue);
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
          // deserialize() keeps the logo as a string unless it is under assets/
          return resource.logo ? resource.logo.toString() : null;
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
          this.savedValue = this.form.value;
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

  // called by the route's canDeactivate, switching tabs only changes the query param and does not ask
  confirmLeave(): Observable<boolean> {
    if (!this.form.dirty) {
      return of(true);
    }
    this.confirmationService.confirm({
      title: "Unsaved changes",
      message: "Your changes to this resource are not saved. Leave the page?",
      confirmationText: "Leave",
      cancelText: "Stay",
      accept: () => {},
      reject: () => {},
    });
    // closing the dialog with Escape or a click outside counts as staying
    return this.confirmationService.dialog.closed.pipe(
      map((response) => response == ConfirmationResponse.accepted)
    );
  }

  // closing or reloading the browser tab, where only the browser's own prompt can be shown
  @HostListener("window:beforeunload", ["$event"])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.form.dirty) {
      event.preventDefault();
    }
  }

  discard() {
    // reset() also marks the form pristine and untouched, and a null logo shows the saved one again
    this.form.reset(this.savedValue);
  }

  // once anything is edited every invalid field shows its error, even one loaded invalid and never touched
  showErrors(name: string): boolean {
    const control = this.form.get(name);
    return control.invalid && (control.touched || this.form.dirty);
  }

  // the tabs holding a field that blocks the save, as the bar can be seen from any tab
  get invalidTabs(): string[] {
    const profileInvalid = Object.entries(this.form.controls).some(
      ([name, control]) => name != "leaderboard_preferences" && control.invalid
    );
    return [
      ...(profileInvalid ? ["Profile"] : []),
      ...(this.leaderboardForm.invalid ? ["Leaderboards"] : []),
    ];
  }

  async onFileSelected(event) {
    if (event.currentTarget) {
      const fileInput: HTMLInputElement = event.currentTarget;
      if (fileInput.files.length > 0) {
        this.form.get("logo").setValue(fileInput.files[0]);
        this.form.get("logo").markAsDirty();
        // so the same file can be picked again after a discard
        fileInput.value = "";
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
