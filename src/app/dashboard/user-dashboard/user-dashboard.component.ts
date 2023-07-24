import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Inject,
  ViewEncapsulation,
} from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { ROUTES, Router, Routes } from "@angular/router";
@Component({
  selector: "app-user-dashboard",
  templateUrl: "./user-dashboard.component.html",
  // encapsulation: ViewEncapsulation.None,
  styleUrls: [
    "./user-dashboard.component.scss",
    // "../../../../node_modules/primeicons/primeicons.css",
    // "../../../../node_modules/primeng/resources/primeng.min.css",
    // "../../../../node_modules/primeng-sass-theme/themes/tailwind/tailwind-light/theme.scss",
  ],
})
export class UserDashboardComponent implements OnInit {
  development = ["development", "local"].includes(environment.env);
  user$: Observable<any>;

  openSidePanel: Boolean = false;
  openMobileMenu: Boolean = false;

  constructor(protected auth: AuthService) {
    this.user$ = this.auth.user$;
  }
  ngOnInit(): void {}
}
