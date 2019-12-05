import { Component,  Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {InternalService} from '../services/internal.service';

@Component({
  selector: 'app-dashboard-userform',
  templateUrl: './dashboard-userform.component.html',
  styleUrls: ['./dashboard-userform.component.scss']
})
export class DashboardUserformComponent implements OnInit {
  buttomName = 'register'
  newUserRegForm = this.fb.group(
    {
      username: ['', Validators.required],
      role: ['', Validators.required],
      displayedName: ['', Validators.required],
      institution: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gmail: ['', Validators.email],
      // alternativeEmail: ['', Validators.email]
    }
  );
  @Input()
  user_obj: object;

  @Input()
  modalRef;

  constructor(private fb: FormBuilder,
              private internalService: InternalService) { }

  ngOnInit() {
    if (this.user_obj.hasOwnProperty('username')) {
      this.newUserRegForm.setValue({
        'username': this.user_obj['username'],
        'role': this.user_obj.hasOwnProperty('role') ? this.user_obj['role'] : '',
        'displayedName':  this.user_obj.hasOwnProperty('displayedName') ? this.user_obj['displayedName'] : '',
        'institution':  this.user_obj.hasOwnProperty('institution') ? this.user_obj['institution'] : '',
        'email':  this.user_obj.hasOwnProperty('email') ? this.user_obj['email'] : '',
        'gmail': this.user_obj.hasOwnProperty('gmail') ? this.user_obj['gmail'] : '',
      });
      this.buttomName = 'update';
    }
  }
  regNewUser() {
    console.log(this.newUserRegForm.value);
    this.internalService.RegisterNewUser(this.newUserRegForm.value).subscribe();
    this.modalRef.hide();

  }
}
