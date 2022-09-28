import { Component, Input, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  env;

  @Input('button-class') button_class = '';
  show_login = false;
  login_link: string;

  constructor(private authService: AuthService) {
    this.login_link = environment.ws + '/auth/orcid'
    // this.env = environment;
  }


  ngOnInit() {
    
  }

}
