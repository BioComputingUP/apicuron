import { CommonModule } from "@angular/common";
import { Component, HostListener, OnInit, ViewEncapsulation } from "@angular/core";
import { BehaviorSubject, Observable, fromEvent } from "rxjs";
import { AuthModule } from "../auth/auth.module";
import { RouterModule } from "@angular/router";
import { delay, filter, shareReplay } from "rxjs/operators";

@Component({
  selector: "navbar",
  templateUrl: "./alt-navbar.component.html",
  styleUrls: ["./alt-navbar.component.scss"],
  imports: [
    RouterModule,
    CommonModule,
    AuthModule,
  ],
  standalone: true
})
export class NavbarComponent implements OnInit {
  
  closed_mobile_menu = true;
  expanded_nav = false;
  show_login = false;
  isCollapsed = new BehaviorSubject<boolean>(true);
  isCollapsed$: Observable<Boolean>;

  constructor() {

    this.isCollapsed$ = this.isCollapsed.asObservable();
  }

  ngOnInit() {
    // this.authService.authentication();
    

    // this.authService.loginData.subscribe(
    //   (displayedName) => (this.loginData = displayedName)
    // );

    fromEvent(window,'scroll').pipe(
      delay(200),
      shareReplay(1)
    ).subscribe(() => {
      this.isCollapsed.next(document.documentElement.scrollTop <= 40)
    })
  }


}
