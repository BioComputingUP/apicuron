import { Component, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject, combineLatest, of } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { NotificationService } from "../notifications-data/notification.service";
import { Notification } from "../notifications-data/models/Notification";
import { Paginated } from "../interfaces/paginated";
import { map, startWith, switchMap } from "rxjs/operators";
@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.component.html",
  styleUrls: ["./notifications.component.scss"],
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<Notification[]>;
  seenNotifications$: Observable<Paginated<Notification>>;

  notificationPagination$ = new BehaviorSubject({ limit: 5, skip: 0 });

  deleteSeenNotification$: Subject<string>;

  constructor(
    protected notificationService: NotificationService,
    protected toast: ToastrService
  ) {
    this.notifications$ =
      this.notificationService.notifications$.asObservable();
    this.deleteSeenNotification$ =
      this.notificationService.deleteSeenNotification$;
  }

  deleteNotification(notificationId) {
    this.deleteSeenNotification$.next(notificationId);
  }
  get currentPage() {
    const val = this.notificationPagination$.value;
    return val.skip / val.limit + 1;
  }

  set currentPage(value) {
    this.update_page(value);
  }

  update_page(page) {
    const filter = this.notificationPagination$.value;
    filter.skip = (page - 1) * filter.limit;
    this.notificationPagination$.next(filter);
  }

  ngOnInit(): void {
    this.seenNotifications$ = combineLatest([
      this.notificationPagination$,
      this.deleteSeenNotification$.pipe(startWith("")),
      this.notificationService.markNotificationAsSeen$.pipe(startWith("")),
    ]).pipe(
      switchMap(([filter, deleteSeen]) => {
        return this.notificationService.getNotifications({
          seen: true,
          ...filter,
        });
      })
    );
  }
}
