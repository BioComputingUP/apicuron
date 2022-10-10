import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  loginData;
  isCollapsed = new BehaviorSubject<boolean>(true)


  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.authentication();
    this.isCollapsed.subscribe(isCollapsed => {
      if (isCollapsed) {
        document.getElementById("navbarButtons").style['min-height'] = '10px';

      } else {
        document.getElementById("navbarButtons").style['min-height'] = '300px';

      }
    });

    this.authService.loginData.subscribe(displayedName => this.loginData = displayedName);
    window.addEventListener("scroll", event => {
      if (this.isCollapsed) {
        if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
          document.getElementById("navbar").style['min-height'] = '60px';
          // document.getElementById("logo_nav").style['margin'] = '0rem 0rem';

        } else {
          document.getElementById("navbar").style['min-height'] = '120px';
          // document.getElementById("logo_nav").style['margin'] = '3rem 0rem';
        }
      }
    });
  }


  logout() {
    this.authService.logout();
  }
}
