import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, pluck } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import * as moment from "moment";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<any>;

  constructor(protected authService: AuthService, protected http: HttpClient, protected toast: ToastrService) {
    this.notifications$ = this.authService.user$.pipe(pluck('notifications'));
  }


  set_notification_as_seen(id: string){
    this.http.delete(environment.ws + '/notifications/' + id, {
      headers: {
        version: '2',
        authorization: this.authService.token_value
      }
    }).subscribe((response) => {
      this.toast.success('Notification Marked as seen !')
      this.notifications$ = this.notifications$.pipe(
        filter((notification) => notification._id != id )
      )
    })
  }

  format_date(date: any){
    return moment(date).fromNow();
  }

  ngOnInit(): void {
  }

}
