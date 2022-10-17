import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

@Component({
  selector: 'auth-dropdown',
  templateUrl: './auth-dropdown.component.html',
  styleUrls: ['./auth-dropdown.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AuthDropdownComponent implements OnInit {
  user$: Observable<any>;

  @Input('button-class') button_class = '';
  show_login = false;
  login_link: string;
  loggedIn$: Observable<any>;

  constructor(protected authService: AuthService) {
    this.login_link = environment.ws + '/auth/orcid'
    this.loggedIn$ = this.authService.loggedIn$
    this.user$ = this.authService.user$

  }

  logout(){
    this.authService.logout()
  }

  ngOnInit(): void {
  }

}
