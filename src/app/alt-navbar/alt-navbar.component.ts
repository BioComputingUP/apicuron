import { Component, HostListener, OnInit } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

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
  
  constructor() {
  }



  ngOnInit() {
    // this.authService.authentication();
    

    // this.authService.loginData.subscribe(
    //   (displayedName) => (this.loginData = displayedName)
    // );
  }

  @HostListener('window:scroll', [ '$event'])
  onScroll (event) {
    if(document.documentElement.scrollTop > 40){
      this.expanded_nav = false;
    }
    else {
      this.expanded_nav = true;
    }
  }

}
