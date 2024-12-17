import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/User.model';
import { Input } from '@angular/core';

@Component({
  selector: 'first-login-popup',
  templateUrl: './first-popup.component.html',
  styleUrls: ['./first-popup.component.scss']
})
export class FirstPopupComponent {
  form: FormGroup<{
    email: FormControl<string>;
    privacy: FormControl<string>;
    receiveUpdates: FormControl<boolean>;
  }> = this.formBuilder.group({
    email: ["", Validators.email],
    privacy: ["", Validators.pattern(new RegExp("private|public"))],
    receiveUpdates: [true]
  });

  avatar: string;

  constructor(
      public dialogRef: DialogRef,
      @Inject(DIALOG_DATA) public data: User,
      protected formBuilder: FormBuilder
    ) {
    this.avatar = data.avatar;
    // Set the initial privacy setting from the User data (default to 'private' if not provided)
    this.form.controls.privacy.setValue(data.privacy || 'public');
    console.log("User Avatar: " + this.avatar);
    console.log("Initial Privacy Setting: " + this.privacy);
  }

  submitForm() {
    console.log(this.form.value);
    this.dialogRef.close();
  }

  selectRadio(value: string) {
    this.form.controls.privacy.setValue(value);
    this.form.controls.privacy.markAsTouched();
  }

  get privacy() {
    return this.form.get('privacy').value;
  }

  get email() {
    return this.form.get('email');
  }
}
