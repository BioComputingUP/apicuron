import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject, Observable, defer, fromEvent, interval } from "rxjs";
import { filter, map, switchMap, take, takeWhile } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../auth/auth.service";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { AuthModule } from "../../auth/auth.module";
import { NotificationService } from "../../notifications-data/notification.service";
import { Notification } from "../../notifications-data/models/Notification";
import { RouterModule } from "@angular/router";
import _ from "lodash";
import { OverlayModule } from "@angular/cdk/overlay";
// import { NotificationsDataModule } from '../../notifications-data/notifications-data.module';
@Component({
  selector: "auth-dropdown",
  templateUrl: "./auth-dropdown.component.html",
  styleUrls: ["./auth-dropdown.component.scss"],
  imports: [
    CommonModule,
    RouterModule,
    AngularSvgIconModule,
    OverlayModule,
  ],
  standalone: true,
})
export class AuthDropdownComponent {
  user$: Observable<any>;

  @Input("button-class") button_class = "";
  show_login = false;
  login_link: string;
  loggedIn$: Observable<any>;
  user_has_resource$: Observable<boolean>;
  notifications$: Observable<Notification[]>;

  _isOpen = new BehaviorSubject<boolean>(false);

  isOpen$: Observable<boolean> = defer(() => this._isOpen.asObservable());

  updateIsOpen(value: boolean) {
    console.log("updateIsOpen");
    this._isOpen.next(value);
  }

  constructor(
    protected authService: AuthService,
    protected notificationService: NotificationService,
    protected toastr: ToastrService
  ) {
    this.login_link = environment.auth_ws + "/auth/orcid";
    this.loggedIn$ = this.authService.loggedIn$;
    this.user$ = this.authService.user$;
    this.notifications$ =
      this.notificationService.notifications$.asObservable();

    this.user_has_resource$ = this.user$.pipe(
      map((user) => {
        if (user && user.resources && user.resources.length > 0) {
          return true;
        }
        return false;
      })
    );
  }

  async copy_key() {
    this.authService
      .loadJwtToken()
      .pipe(take(1))
      .subscribe((token: string) => {
        navigator.clipboard.writeText(token);
        this.toastr.show("API Key Sucessfully copied", "API KEY", {
          positionClass: "toast-bottom-right",
        });
      });
  }

  logout() {
    this.authService.logout();
  }

  login() {
    this.authService.openOauthDialog();
  }

  generate_avatar(name: string) {
    const hash = encodeURIComponent(name);
    const defaultImage = encodeURIComponent(
      `https://api.dicebear.com/5.x/identicon/png/seed=${hash}&scale=80&radius=50`
    );
    return `https://www.gravatar.com/avatar/${hash}?d=${defaultImage}`;
  }
}
