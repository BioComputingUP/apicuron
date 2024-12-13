import { Dialog, DialogRef } from "@angular/cdk/dialog";
import { Component, OnInit } from "@angular/core";
import { FirstPopupComponent } from "./first-popup/first-popup.component";
import { AuthService } from "../auth/auth.service";

import {
  switchMap,
  filter,
  map,
  distinct,
  distinctUntilChanged,
} from "rxjs/operators";
import { BehaviorSubject, Observable } from "rxjs";
import { User } from "../models/User.model";
@Component({
  selector: "first-login-dialog",
  templateUrl: "first-login.component.html",
})
export class FirstLoginDialog implements OnInit {
  user$ = this.auth.user$;
  constructor(public dialog: Dialog, protected auth: AuthService) {}

  ngOnInit(): void {
    this.auth.loginEvent$
      .pipe(
        filter((loginEvent) => loginEvent), // only observe login events
        switchMap(() => this.auth.user$),
        filter((user) => user.firstTimeLogin())
      )
      .subscribe((user) => {
        this.openDialog(user);
      });
  }
  openDialog(user) {
    this.dialog.open(FirstPopupComponent, {
      data: {
        userData: user,
      },
    });
  }
}
