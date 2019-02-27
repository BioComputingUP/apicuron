import { Component, Input, OnInit } from '@angular/core';
import {FormGroup, FormBuilder, Validators, AbstractControl, FormControl} from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  public pubmedForm: FormGroup;

  @Input()profile_obj;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.pubmedForm = this.fb.group({
        firstname: [ this.profile_obj.firstname],
        surname: [ this.profile_obj.surname],
        orcid: [ this.profile_obj.orcid],
        organization: [''],
        prosition: [''],
        personal_page: [''],
        summary: [''],
        profile_picture: ['']
      });
  }

}
