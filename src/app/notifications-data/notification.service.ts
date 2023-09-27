import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import {
  filter,
  map,
  pluck,
  switchMap,
  takeUntil,
} from "rxjs/operators";
import { Notification } from "./models/Notification";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { NavigationEnd, Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class NotificationService implements OnDestroy {
  destroy$ = new Subject<boolean>();
  constructor(
    protected http: HttpClient,
    protected router: Router,
    protected authService: AuthService
  ) {
    // if the user is loggedIn update the notifications on each page change
    this.authService.loggedIn$
      .pipe(
        takeUntil(this.destroy$),
        filter(Boolean),
        switchMap(() => this.router.events),
        filter((event) => event instanceof NavigationEnd),
        switchMap(() => {
          return this.http
            .get(environment.ws + "/notifications", {
              headers: {
                version: "2",
              },
            })
            .pipe(
              pluck("data"),
              map((notifications: any[]) => {
                return notifications.map((notif) =>
                  new Notification().deserialize(notif)
                );
              })
            );
        })
      )
      .subscribe((notifications) => {
        this.notifications$.next(notifications);
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  notifications$ = new BehaviorSubject<Notification[]>([]);

  set_as_seen(id: string): Observable<any> {
    const notifications = this.notifications$.getValue();
    const updated_notifications = notifications.filter(
      (notification: Notification) => {
        return notification.id != id;
      }
    );
    this.notifications$.next(updated_notifications);

    return this.http.delete(`${environment.ws}/notifications/${id}`, {
      headers: {
        version: "2",
      },
    });
  }
}
