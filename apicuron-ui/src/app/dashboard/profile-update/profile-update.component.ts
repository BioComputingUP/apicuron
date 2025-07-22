import { Component } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Observable } from "rxjs";
import { catchError, map, switchMap, take } from "rxjs/operators";
import { AuthService } from "src/app/auth/auth.service";
import { UsersService } from "../services/users.service";
import { UpdateUser, User } from "../../models/User.model";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "profile-component",
  templateUrl: "./profile-update.component.html",
  styleUrls: ["./profile-update.component.scss"],
})
export class ProfileUpdateComponent {
  user$: Observable<any>;
  form: FormGroup<{
    email: FormControl<string>;
    privacy: FormControl<string>;
  }> = this.formBuilder.group({
    email: ["", Validators.email],
    privacy: ["", Validators.pattern(new RegExp("private|public"))],
  });
  constructor(
    protected formBuilder: FormBuilder,
    protected auth: AuthService,
    protected userService: UsersService,
    protected toastr: ToastrService
  ) {
    this.user$ = this.auth.user$;
    this.user$.pipe(take(1)).subscribe((user: any) => {
      this.form.controls.email.setValue(user.email ?? "");
      this.form.controls.privacy.setValue(user.privacy ?? "public");
    });
  }

  selectRadio(value: string) {
    this.form.controls.privacy.setValue(value);
    this.form.controls.privacy.markAsTouched();
  }
  submitForm() {
    this.user$.pipe(
      map((user: User) => {
        return new UpdateUser().deserialize({
          orcid_id: user.orcid_id,
          ...this.form.value,
        });
      }),
      switchMap((userUpdate: UpdateUser) => {
        return this.userService.updateUser(userUpdate);
      }),
      catchError((err, caught) => {
            this.toastr.error('Failed to update user data', 'User update failed');
            throw err;
      }),
      take(1)
    ).subscribe((data) => {
        this.toastr.success('User data successfully updated', 'User update successfull')
    })
  }

  get privacy() {
    return this.form.get("privacy").value;
  }

  get email() {
    return this.form.get("email");
  }
}
