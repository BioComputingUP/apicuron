import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../notifications-data/notification.service';
import { Notification } from '../../notifications-data/models/Notification';
import { Observable, fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements AfterViewInit {
  toggle_text$: Observable<string>;

  constructor(protected notificationService: NotificationService, protected toast: ToastrService) {

  }

  @Input() notification: Notification;

  // this is a reference to a detailsElement that represents the dropdown
  @ViewChild('details_elem') details_elem: ElementRef<HTMLDetailsElement>;

  ngAfterViewInit(): void {
    // when the dropdown is toggled we update the display of the toggle button depending on the state of the dropdown
    this.toggle_text$ = fromEvent(this.details_elem.nativeElement, 'toggle').pipe(
      map(() => {
        return this.details_elem.nativeElement.open ? 'close' : 'expand'
      }),
      // we set the default text value as expand
      startWith('expand')
    )

  }

  set_notification_as_seen(id: string) {
    this.notificationService.set_as_seen(id).subscribe(() => {
      this.toast.success(`Notification Marked as seen !`)
    })
  }

  get dateTime () {
    return moment(this.notification.created_at).format('LLLL');
  }


}
