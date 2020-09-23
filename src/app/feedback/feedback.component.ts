import {Component, OnInit, AfterViewInit} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray, } from '@angular/forms';

import {InternalService} from '../services/internal.service';
@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  public feedbackForm: FormGroup;
  form: FormGroup;
  feedback_sent = false;

  errors = [];
  constructor(private fb: FormBuilder,
              private internalService: InternalService) { }

  ngOnInit() {
    this.feedbackForm = this.fb.group({
        name: [null, [Validators.minLength(3), Validators.required]],
        email: [null, [Validators.email, Validators.required]],
        subject: [null],
        message: [null],
        orcid: [null],
      },
    );

  }

  sendFeedback() {
    this.errors = [];
    if (this.feedbackForm.value['subject']) {
      if (this.feedbackForm.value['subject'].length < 5) {
        this.errors.push('Subject is mandatory and needs to be minimum 5 characters');
      }
    } else {
      this.errors.push('Subject is mandatory and needs to be minimum 5 characters');
    }

    if (this.feedbackForm.value['message']) {
      if (this.feedbackForm.value['message'].length < 15) {
        this.errors.push('Message is mandatory and needs to be minimum 15 characters');
      }
    } else {
      this.errors.push('Message is mandatory and needs to be minimum 15 characters');
    }

    if (this.errors.length === 0) {

      this.internalService.SendFeedback({
        name: this.feedbackForm.value['name'],
        email: this.feedbackForm.value['email'],
        message: this.feedbackForm.value['message'],
        subject: this.feedbackForm.value['subject'] + ' feedback',
        type: this.feedbackForm.value['type']
      }).subscribe((c) => {
        this.feedback_sent = true;
      });
    }
  }
}
