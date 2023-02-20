import { CommonModule } from "@angular/common";
import { Component, HostListener, OnInit, ViewEncapsulation } from "@angular/core";
import { BehaviorSubject, Observable, fromEvent } from "rxjs";
import { AuthModule } from "../auth/auth.module";
import { delay, filter, tap } from "rxjs/operators";
import { RouterModule } from "@angular/router";

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
  
  constructor() {
    const scrollEvent$ = fromEvent(window, 'scroll').pipe(
      delay(200),
    )

    scrollEvent$.pipe(
      filter(() => document.documentElement.scrollTop > 40)
    ).subscribe((event) => {
        this.expanded_nav = false;
    })

    scrollEvent$.pipe(
      filter(() => document.documentElement.scrollTop < 40)
    ).subscribe((event) => {
        this.expanded_nav = true;
    })
  }

  ngOnInit() {
  }


}
