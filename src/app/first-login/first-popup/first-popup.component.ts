import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { catchError, take } from "rxjs/operators";
import { UsersService } from "src/app/dashboard/services/users.service";
import { UpdateUser, User } from "src/app/models/User.model";

@Component({
  selector: "first-login-popup",
  templateUrl: "./first-popup.component.html",
  styleUrls: ["./first-popup.component.scss"],
})
export class FirstPopupComponent implements OnInit {
  isChristmas: boolean = false;
  form: FormGroup<{
    email: FormControl<string>;
    privacy: FormControl<string>;
    acceptsEmails: FormControl<boolean>;
    emailVisibility: FormControl<boolean>;
  }> = this.formBuilder.group({
    email: [
      "",
      [
        Validators.email,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
      ],
    ],
    privacy: ["public", Validators.pattern(new RegExp("private|public"))],
    acceptsEmails: [true],
    emailVisibility: [true],
  });
  user: User;
  avatar: string;

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: User,
    protected formBuilder: FormBuilder,
    private userService: UsersService,
    private toastr: ToastrService
  ) {
    this.user = data;
    this.avatar = data.avatar;
  }

  isOpen: boolean = false;

  ngOnInit() {
    // Check if today is Christmas (December 25)
    const today = new Date();
    const christmasDate = new Date(2024, 11, 25);

    setTimeout(() => {
      this.isOpen = true;
    }, 50);

    // If the current date is on or before Christmas, show Christmas content
    this.isChristmas = today <= christmasDate;
  }

  submitForm() {
    console.log(this.form.value);
    const updateUser = new UpdateUser().deserialize({
      orcid_id: this.user.orcid_id,
      ...this.form.value,
      primary: true,
      isNewLogin: false,
    });
    console.log("User data to update:");
    console.log(updateUser)

    console.log(`serialized user data to update: ${JSON.stringify (updateUser.serialize(), null, 2)}`);

    this.userService
      .updateUser(updateUser)
      .pipe(
        catchError((err, caught) => {
          this.toastr.error("Failed to update user data", "User update failed");
          throw err;
        }),
        take(1)
      )
      .subscribe((data) => {
        this.toastr.success(
          "User data successfully updated",
          "User update successfull"
        );
      });

    this.dialogRef.close();
  }

  selectRadio(value: string) {
    this.form.controls.privacy.setValue(value);
    this.form.controls.privacy.markAsTouched();
  }

  get privacy() {
    return this.form.get("privacy").value;
  }

  get email() {
    return this.form.get("email");
  }
}
