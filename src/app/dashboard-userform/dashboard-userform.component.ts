import {Component, Input, OnInit} from '@angular/core';
import {ValidatorFn, FormGroup, UntypedFormArray, UntypedFormBuilder, Validators, AbstractControl, FormControl} from '@angular/forms';
import {InternalService} from '../services/internal.service';

@Component({
  selector: 'app-dashboard-userform',
  templateUrl: './dashboard-userform.component.html',
  styleUrls: ['./dashboard-userform.component.scss']
})
export class DashboardUserformComponent implements OnInit {
  buttomName = 'register';
  newUserRegForm;
  @Input()
  user_obj: object;

  @Input()
  modalRef;

  constructor(private fb: UntypedFormBuilder,
              private internalService: InternalService) {
  }

  ngOnInit() {
    if (this.user_obj.hasOwnProperty('username')) {

      this.buttomName = 'update';
    }
      this.newUserRegForm = this.fb.group(
        {
          username: [this.user_obj.hasOwnProperty('username') ? this.user_obj['username'] : '', Validators.required],
          role: [this.user_obj.hasOwnProperty('role') ? this.user_obj['role'] : '', Validators.required],
          displayedName: [this.user_obj.hasOwnProperty('full_name') ? this.user_obj['full_name'] : ''],
          institution: [this.user_obj.hasOwnProperty('institution') ? this.user_obj['institution'] : '', Validators.required],
          email: [this.user_obj.hasOwnProperty('email') ? this.user_obj['email'] : '', [Validators.required, Validators.email]],
          gmail: [this.user_obj.hasOwnProperty('gmail') ? this.user_obj['gmail'] : '', Validators.email],
          orcid_id: [this.user_obj.hasOwnProperty('orcid_id') ? this.user_obj['orcid_id'] : ''],
          resources: this.fb.array([]),
        }
      );

    if (this.user_obj.hasOwnProperty('resources') ? this.user_obj['resources'].length > 0 : false) {
      const resources = this.newUserRegForm.get('resources') as UntypedFormArray;
      this.user_obj['resources'].forEach(condition => {
        resources.push(this.fb.group(condition));
      });
    } else {
      const resources = this.newUserRegForm.get('resources') as UntypedFormArray;
      resources.push(this.fb.group({
        name: [null],
        id: [null]
      }));
    }
  }

  regNewUser() {
    console.log(this.newUserRegForm.value);
    this.internalService.RegisterNewUser(this.newUserRegForm.value).subscribe();
    this.modalRef.hide();

  }
  deleteUser() {
    console.log(this.newUserRegForm.value['username']);
    this.internalService.DeleteUser(this.newUserRegForm.value['username']).subscribe();
    this.modalRef.hide();

  }

  addFormArrayElement() {
    const rows = this.newUserRegForm.get('resources') as UntypedFormArray;
    rows.push(this.fb.group({
      name: [null, Validators.required],
      id: [null, Validators.required]
    }));
  }

  removeFormArrayElement(index) {
    const rows = this.newUserRegForm.get('resources') as UntypedFormArray;
    rows.removeAt(index);
    if (rows.length === 0) {
      rows.push(this.fb.group({
        name: [null, Validators.required],
        id: [null, Validators.required]
      }));
    }
  }
}
