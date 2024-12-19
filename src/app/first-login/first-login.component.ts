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

    //Debug
    // const test_user = {
    //   orcid_id: "000000000",
    //   displayedName: "Albert Einstein",
    //   affiliation: "Humanity",
    //   privacy: "public",
      
    //   generate_avatar() {
    //     return "/assets/user.png";
    //   }
    // }
    // this.openDialog(test_user);
    //End Debug
  
    this.auth.loginEvent$
      .pipe(
        tap((loginData) => {
          console.log("FLC:", loginData.user.orcid_id);
        }),
        filter((loginData) => loginData.isNew ),
        takeUntil(this.destroy$)
      )
      .subscribe((loginData) => {
        this.openDialog(loginData.user);
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
