import { Dialog } from "@angular/cdk/dialog";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FirstPopupComponent } from "./first-popup/first-popup.component";
import { AuthService } from "../auth/auth.service";

import { filter, takeUntil, tap } from "rxjs/operators";
import { Subject } from "rxjs";
@Component({
  selector: "first-login-dialog",
  templateUrl: "first-login.component.html",
})
export class FirstLoginDialog implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  constructor(public dialog: Dialog, protected auth: AuthService) {}

  ngOnInit(): void {
    this.auth.loginEvent$
      .pipe(
        tap((user) => {
          console.log("FLC:", user.orcid_id);
        }),
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
      disableClose: true,
    });
  }
}
