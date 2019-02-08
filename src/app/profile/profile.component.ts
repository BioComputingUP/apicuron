import { Component, OnInit } from '@angular/core';
import {InternalService} from '../services/internal.service';
import {concat, BehaviorSubject, Observable, combineLatest} from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  profileData: object;

  constructor(private internalService: InternalService) { }

  ngOnInit() {

    const orcidID = window.location.pathname.substring(9);

    // console.log(disprotId);

    const observables = [];
    observables.push(this.internalService.GetProfile(orcidID));
    concat(...observables).subscribe(
      profileData => {
        this.profileData = profileData;
      },
      err => console.log(err),
      () => {}
    );

  }

}
