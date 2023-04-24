import { Component, HostListener, OnInit, ViewEncapsulation } from "@angular/core";
import { BehaviorSubject, Observable, fromEvent } from "rxjs";
import { delay, filter, shareReplay } from "rxjs/operators";

@Component({
  selector: "app-alt-navbar",
  templateUrl: "./alt-navbar.component.html",
  styleUrls: ["./alt-navbar.component.scss"],
})
export class AltNavbarComponent implements OnInit {
  
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
