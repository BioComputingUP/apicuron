import { Dialog } from "@angular/cdk/dialog";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FirstPopupComponent } from "./first-popup/first-popup.component";
import { AuthService } from "../auth/auth.service";

import { filter, takeUntil, tap, delay } from "rxjs/operators";
import { Subject } from "rxjs";
@Component({
  selector: "first-login-dialog",
  templateUrl: "first-login.component.html",
})
export class FirstLoginDialog implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  constructor(public dialog: Dialog, protected auth: AuthService) {}

  ngOnInit(): void {
    this.testUser();
    this.auth.loginEvent$
      .pipe(
        filter((loginData) => loginData.isNew),
        delay(500),
        takeUntil(this.destroy$)
      )
      .subscribe((loginData) => {
        this.openDialog(loginData.user);
      });
  }
  private testUser() {
    const test_user = {
      orcid_id: "000000000",
      displayedName: "Albert Einstein",
      affiliation: "Humanity",
      privacy: "public",

      generate_avatar() {
        return "/assets/user.png";
      },
    };
    this.openDialog(test_user);
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
