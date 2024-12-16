import { Dialog, DialogRef } from "@angular/cdk/dialog";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FirstPopupComponent } from "./first-popup/first-popup.component";
import { AuthService } from "../auth/auth.service";

import {
  switchMap,
  filter,
  map,
  distinct,
  distinctUntilChanged,
  tap,
  takeUntil,
} from "rxjs/operators";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { User } from "../models/User.model";
@Component({
  selector: "first-login-dialog",
  templateUrl: "first-login.component.html",
})
export class FirstLoginDialog implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  constructor(public dialog: Dialog, protected auth: AuthService) {}

  ngOnInit(): void {
   console.log("NG on init FirstLoginDialog");
   
    this.auth.loginEvent$
      .pipe(
        tap((user) => console.log("FirstLoginDialog", user)),
        filter((user) => user.firstTimeLogin()), 
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        this.openDialog(user);
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }
  openDialog(user) {

    
    this.dialog.open(FirstPopupComponent, {
      data: user,
      
    });
  }
}
