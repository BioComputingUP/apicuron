import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {FormGroup, FormBuilder, Validators, AbstractControl, FormControl} from '@angular/forms';
import {InternalService} from '../services/internal.service';
import { Router } from '@angular/router';
import {logger} from 'codelyzer/util/logger';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  public pubmedForm: FormGroup;
  formData = new FormData();
  // profile_picture_text = "add new profile picture";
  env;
  imgURL: any;

  @Input()profile_obj;
  @ViewChild('file') file;

  constructor(private fb: FormBuilder,
              private router: Router,
              private internalService: InternalService) { }

  ngOnInit() {
    console.log(this.profile_obj)
    this.env = environment;

    this.pubmedForm = this.fb.group({
      firstname: [ this.profile_obj.firstname],
      surname: [ this.profile_obj.surname],
      orcid: [ this.profile_obj.orcid],
      organization: [this.profile_obj.organization],
      department: [this.profile_obj.department],
      laboratory: [this.profile_obj.laboratory],
      position: [this.profile_obj.position],
      personal_page: [this.profile_obj.personal_page],
      summary: [this.profile_obj.summary],
      });




  }

  sendData() {
    const sendData = {};
    if (this.pubmedForm.value.firstname) {
      sendData['firstname'] = this.pubmedForm.value.firstname;
    }
    if (this.pubmedForm.value.surname) {
      sendData['surname'] = this.pubmedForm.value.surname;
    }
    if (this.pubmedForm.value.orcid) {
      sendData['orcid'] = this.pubmedForm.value.orcid;
    }
    if (this.pubmedForm.value.organization) {
      sendData['organization'] = this.pubmedForm.value.organization;
    }
    if (this.pubmedForm.value.department) {
      sendData['department'] = this.pubmedForm.value.department;
    }
    if (this.pubmedForm.value.laboratory) {
      sendData['laboratory'] = this.pubmedForm.value.laboratory;
    }
    if (this.pubmedForm.value.position) {
      sendData['position'] = this.pubmedForm.value.position;
    }
    if (this.pubmedForm.value.summary) {
      sendData['summary'] = this.pubmedForm.value.summary;
    }
    if (this.pubmedForm.value.personal_page) {
      sendData['personal_page'] = this.pubmedForm.value.personal_page;
    }
    // if (this.pubmedForm.value.) {
    //   sendData. = this.pubmedForm.value.;
    // }

    this.internalService.PostProfileData(sendData).subscribe();

    console.log(sendData);

    if (this.imgURL) {
      this.internalService.PostProfilePicture(this.formData,  this.profile_obj.id).subscribe();
      // this.internalService.PostProfilePicture('valmai').subscribe();
    }

    this.router.navigate(['/profile/' + this.profile_obj.id]);
  }

  addFiles() {
    this.file.nativeElement.click();
  }


  onFilesAdded() {
    console.log(this.file);
    const reader = new FileReader();
    this.formData.append('profile_picture', this.file.nativeElement.files[0], this.file.nativeElement.files[0].name);
    reader.readAsDataURL(this.file.nativeElement.files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };

}


}
