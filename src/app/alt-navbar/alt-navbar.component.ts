import { Component, HostListener, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-alt-navbar",
  templateUrl: "./alt-navbar.component.html",
  styleUrls: ["./alt-navbar.component.scss"],
})
export class AltNavbarComponent implements OnInit {
  
  closed_mobile_menu = true;
  expanded_nav = false;
  loginData;
  show_login = false;
  isCollapsed = new BehaviorSubject<boolean>(true);
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.authentication();
    // this.isCollapsed.subscribe((isCollapsed) => {
    //   if (isCollapsed) {
    //     document.getElementById("navbarButtons").style["min-height"] = "10px";
    //   } else {
    //     document.getElementById("navbarButtons").style["min-height"] = "300px";
    //   }
    // });
    

    this.authService.loginData.subscribe(
      (displayedName) => (this.loginData = displayedName)
    );
    // window.addEventListener("scroll", (event) => {
    //   if (this.isCollapsed) {
    //     if (
    //       document.body.scrollTop > 40 ||
    //       document.documentElement.scrollTop > 40
    //     ) {
    //       document.getElementById("navbar").style["min-height"] = "60px";
    //       // document.getElementById("logo_nav").style['margin'] = '0rem 0rem';
    //     } else {
    //       document.getElementById("navbar").style["min-height"] = "120px";
    //       // document.getElementById("logo_nav").style['margin'] = '3rem 0rem';
    //     }
    //   }
    // });
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

  logout() {
    this.authService.logout();
  }
}
