import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  loginData;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.authentication();
    this.authService.loginData.subscribe(displayedName => this.loginData = displayedName);
  }
  logout() {
    this.authService.logout();
  }
}
