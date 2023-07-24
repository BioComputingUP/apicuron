import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {

  development = ['development', 'local'].includes(environment.env);
  bottomCoord: number;
  user$: Observable<any>;

  openSidePanel: Boolean = false;
  openMobileMenu: Boolean = false;

  constructor(protected auth: AuthService) {
    this.user$ = this.auth.user$
  }
  ngOnInit(): void {
    this.bottomCoord = document.getElementById('dev_warning_header').getBoundingClientRect().bottom;
  }


}
