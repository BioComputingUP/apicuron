import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import {
  catchError,
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
import { Paginated } from "../interfaces/paginated";
import { ToastrService } from "ngx-toastr";

@Injectable()
export class NotificationService implements OnDestroy {
  destroy$ = new Subject<boolean>();
  constructor(
    protected http: HttpClient,
    protected router: Router,
    protected toast: ToastrService,
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
          return this.getNotifications({ seen: false });
        })
      )
      .subscribe((notifications) => {
        this.notifications$.next(notifications.data);
      });

    this.deleteSeenNotification$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((notificationId: string) => {
          return this.deleteNotification(notificationId);
        })
      )
      .subscribe(() => {
        this.toast.success("Notification successfully deleted !");
      });

    this.markNotificationAsSeen$
      .pipe(
        switchMap((id: string) => {
          return this.set_as_seen(id);
        })
      )
      .subscribe(() => {
        this.toast.success(`Notification Marked as seen !`);
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  deleteSeenNotification$ = new Subject<string>();
  markNotificationAsSeen$ = new Subject<string>();

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

  deleteNotification(id: string) {
    return this.http.delete(`${environment.ws}/notifications/${id}`, {
      headers: {
        version: "2",
      },
      params: {
        "hard-delete": true,
      },
    });
  }

  getNotifications({
    seen,
    skip,
    limit,
  }: {
    seen: boolean;
    skip?: number;
    limit?: number;
  }): Observable<Paginated<Notification>> {
    return this.http
      .get(environment.ws + "/notifications", {
        headers: {
          version: "2",
        },
        params: {
          seen,
          limit: limit ?? undefined,
          skip: skip ?? undefined,
        },
      })
      .pipe(
        map((notifications: Paginated<Notification>) => {
          notifications.data = notifications.data.map((notification) =>
            new Notification().deserialize(notification)
          );
          return notifications;
        })
      );
  }
}
