import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import * as moment from "moment";
import { ToastrService } from "ngx-toastr";
import { NotificationService } from "../../notifications-data/notification.service";
import { Notification } from "../../notifications-data/models/Notification";
import { BehaviorSubject, Observable, fromEvent } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: "notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
})
export class NotificationComponent {
  toggle_text$ = new BehaviorSubject("expand");

  constructor(
    protected notificationService: NotificationService,
    protected toast: ToastrService
  ) {}

  @Input() notification: Notification;

  // this is a reference to a detailsElement that represents the dropdown
  @ViewChild("details_elem") details_elem: ElementRef<HTMLDetailsElement>;

  toggleVisibility() {
    this.toggle_text$.next(
      !this.details_elem.nativeElement.open ? "close" : "expand"
    );
    this.details_elem.nativeElement.open =
      !this.details_elem.nativeElement.open;
  }

  set_notification_as_seen(id: string) {
    this.notificationService.markNotificationAsSeen$.next(id);
  }

  get dateTime() {
    return moment(this.notification.created_at).format("LLLL");
  }

  deleteNotification() {
    this.notificationService.deleteSeenNotification$.next(this.notification.id)
  }
}
