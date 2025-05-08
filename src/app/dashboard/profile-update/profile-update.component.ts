import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { catchError, map, Observable, Subject, switchMap, take } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { UpdateUser, User } from "src/app/models/User.model";
import { EmailVisibilityType } from "src/app/util/privacy.helper";
import { UsersService } from "../services/users.service";

@Component({
  selector: "profile-component",
  templateUrl: "./profile-update.component.html",
  styleUrls: ["./profile-update.component.scss"],
})
export class ProfileUpdateComponent implements OnInit, OnDestroy {
  user$: Observable<User>;
  destroy$: Subject<boolean> = new Subject();
  form: FormGroup<{
    privacy: FormControl<string>;
    emails: FormArray<
      FormGroup<{
        email: FormControl<string>;
        primary: FormControl<boolean>;
        visibility: FormControl<boolean>;
      }>
    >;
  }> = this.formBuilder.group({
    privacy: ["", Validators.pattern(new RegExp("private|public"))],
    emails: this.formBuilder.array<
      FormGroup<{
        email: FormControl<string>;
        primary: FormControl<boolean>;
        visibility: FormControl<boolean>;
      }>
    >([]),
  });
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
  ngOnInit(): void {
    this.user$ = this.auth.user$;

    this.user$.pipe(take(1)).subscribe((user: User) => {
      user.emails.map((email) => {
        this.form.controls.emails.push(
          this.formBuilder.group({
            email: [
              { value: email.email, disabled: true },
              [Validators.email, Validators.required],
              ,
            ],
            primary: [{ value: email.primary, disabled: true }],
            visibility: [
              {
                value: email.visibility === EmailVisibilityType.public,
                disabled: true,
              },
            ],
          })
        );
      });

      this.form.controls.privacy.setValue(user.privacy ?? "public");
    });
  }
  constructor(
    protected formBuilder: FormBuilder,
    protected auth: AuthService,
    protected userService: UsersService,
    protected toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  selectRadio(value: string) {
    this.form.controls.privacy.setValue(value);
    this.form.controls.privacy.markAsTouched();
  }
  submitForm() {
    this.form.markAllAsTouched();
    console.log(`validation`, this.form.valid);
    if (this.form.valid) {
      this.user$
        .pipe(
          map((user: User) => {
            const formValues = this.form.getRawValue();
            const serializedEmails = formValues.emails.map((email) => ({
              email: email.email,
              primary: email.primary,
              visibility: email.visibility
                ? EmailVisibilityType.public
                : EmailVisibilityType.private,
            }));

            return new UpdateUser().deserialize({
              orcid_id: user.orcid_id,
              privacy: formValues.privacy,
              emails: serializedEmails,
            });
          }),
          switchMap((userUpdate: UpdateUser) => {
            return this.userService.updateUser(userUpdate);
          }),
          catchError((err, caught) => {
            this.toastr.error(
              "Failed to update user data",
              "User update failed"
            );
            throw err;
          }),
          take(1)
        )
        .subscribe((data) => {
          this.toastr.success(
            "User data successfully updated",
            "User update successful"
          );
        });
    }
  }

  get privacy() {
    return this.form.get("privacy").value;
  }

  get emails() {
    return this.form.get("emails") as FormArray;
  }

  addEmail() {
    this.emails.push(
      this.formBuilder.group({
        email: [
          { value: "", disabled: false },
          [Validators.email, Validators.required],
        ],
        primary: [false],
        visibility: [false],
      })
    );
  }

  removeEmail(index: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this email?"
    );
    if (confirmDelete) {
      this.emails.removeAt(index);
    }
  }

  enableFields(index: number) {
    const emailGroup = this.emails.at(index) as FormGroup;

    emailGroup.get("email").enable();
    emailGroup.get("primary").enable();
    emailGroup.get("visibility").enable();
    console.log("Email control state:", emailGroup.get("email"));
    console.log("Primary control state:", emailGroup.get("primary"));
    console.log("Visibility control state:", emailGroup.get("visibility"));
    emailGroup.markAsTouched();

    // Ensure change detection runs
    this.emails.updateValueAndValidity();
    this.cdr.detectChanges();
  }
  getEmailError(index: number): boolean {
    const emails = this.form.get("emails") as FormArray;
    return (
      emails.at(index).errors?.["email"] &&
      (emails.at(index).dirty || emails.at(index).touched)
    );
  }
}
