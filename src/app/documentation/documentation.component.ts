import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment';
import {AuthService} from '../services/auth.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss']
})
export class DocumentationComponent implements OnInit {
  wsname = environment.ws;
  localAuth = new BehaviorSubject<object>({});

  constructor(public authService: AuthService) { }

  ngOnInit() {
    this.authService.loginData.subscribe(authData => {
      if (this.localAuth.value !== authData) {
        this.localAuth.next(authData);
      }
    });
  }

}
