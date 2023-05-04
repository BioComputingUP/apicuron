import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../notifications-data/notification.service';
import { Notification } from '../../notifications-data/models/Notification';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  constructor(protected notificationService: NotificationService, protected toast: ToastrService) { }

  @Input() notification: Notification;

  ngOnInit(): void {
  }

  set_notification_as_seen(id: string){
    this.notificationService.set_as_seen(id).subscribe(() => {
      this.toast.success(`Notification Marked as seen !`)
    })
  }

  format_date(date: any){
    return moment(date).fromNow();
  }

}
