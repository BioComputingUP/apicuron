import { Component } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { UsersService } from "../services/users.service";

@Component({
  selector: "profile-component",
  templateUrl: "./profile-update.component.html",
  styleUrls: ["./profile-update.component.scss"],
})
export class ProfileUpdateComponent {
  user$: Observable<any>;
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
    emails: this.formBuilder.array([
      this.formBuilder.group({
        email: ["", Validators.email],
        primary: [true],
        visibility: [false],
      }),
    ]),
  });
  constructor(
    protected formBuilder: FormBuilder,
    protected auth: AuthService,
    protected userService: UsersService,
    protected toastr: ToastrService
  ) {
    this.user$ = this.auth.user$;
    //TODO: populate the form with the user emails
    // this.user$.pipe(take(1)).subscribe((user: any) => {
    //   this.form.controls.emails.setValue(user.email ?? "");
    //   this.form.controls.privacy.setValue(user.privacy ?? "public");
    // });
  }

  selectRadio(value: string) {
    this.form.controls.privacy.setValue(value);
    this.form.controls.privacy.markAsTouched();
  }
  submitForm() {
    console.log(this.form.value);
    // this.user$
    //   .pipe(
    //     map((user: User) => {
    //       return new UpdateUser().deserialize({
    //         orcid_id: user.orcid_id,
    //         ...this.form.value,
    //       });
    //     }),
    //     switchMap((userUpdate: UpdateUser) => {
    //       return this.userService.updateUser(userUpdate);
    //     }),
    //     catchError((err, caught) => {
    //       this.toastr.error("Failed to update user data", "User update failed");
    //       throw err;
    //     }),
    //     take(1)
    //   )
    //   .subscribe((data) => {
    //     this.toastr.success(
    //       "User data successfully updated",
    //       "User update successfull"
    //     );
    //   });
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
        email: ["", Validators.email],
        primary: [false],
        visibility: [false, Validators.pattern(new RegExp("private|public"))],
      })
    );
  }

  removeEmail(index: number) {
    this.emails.removeAt(index);
  }

  getEmailError(index: number): boolean {
    const emails = this.form.get("emails") as FormArray;
    return (
      emails.at(index).errors?.["email"] &&
      (emails.at(index).dirty || emails.at(index).touched)
    );
  }
}
