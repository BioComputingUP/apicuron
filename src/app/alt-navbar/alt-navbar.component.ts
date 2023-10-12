import { CommonModule } from "@angular/common";
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { BehaviorSubject, Observable, Subject, fromEvent } from "rxjs";
import { AuthModule } from "../auth/auth.module";
import { ActivatedRoute, RouterModule, UrlSegment } from "@angular/router";
import {
  delay,
  filter,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from "rxjs/operators";
import { AuthDropdownComponent } from "src/app/components/auth-dropdown/auth-dropdown.component";
import { AngularSvgIconModule } from "angular-svg-icon";
@Component({
  selector: "navbar",
  templateUrl: "./alt-navbar.component.html",
  styleUrls: ["./alt-navbar.component.scss"],
  imports: [
    RouterModule,
    CommonModule,
    AuthModule,
    AuthDropdownComponent,
    AngularSvgIconModule,
  ],
  standalone: true,
})
export class NavbarComponent implements OnInit, OnDestroy {
  closed_mobile_menu = true;
  expanded_nav = false;
  show_login = false;
  isCollapsed = new BehaviorSubject<boolean>(true);
  isCollapsed$: Observable<Boolean>;

  destroy$ = new Subject<Boolean>();

  constructor(protected route: ActivatedRoute) {
    this.isCollapsed$ = this.isCollapsed.asObservable();
  }

  ngOnInit() {
    // this.authService.authentication();

    // this.authService.loginData.subscribe(
    //   (displayedName) => (this.loginData = displayedName)
    // );

    fromEvent(window, "scroll")
      .pipe(
        filter(() => {
          const routeData = this.route.data as BehaviorSubject<any>;
          return !routeData.value['disableGrowingNav']
        }),
        delay(200),
        shareReplay(1),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.isCollapsed.next(document.documentElement.scrollTop <= 40);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
