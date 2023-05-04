import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../notifications-data/notification.service';
import { Notification } from '../notifications-data/models/Notification';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<Notification[]>;

  constructor(protected notificationService: NotificationService, protected toast: ToastrService) {
    this.notificationService.load_notifications()
    this.notifications$ = this.notificationService.notifications$.asObservable();
  }





  ngOnInit(): void {
  }

}
