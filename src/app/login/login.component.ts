import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  env;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.env = environment;

  }

}
