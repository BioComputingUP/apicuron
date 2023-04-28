import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  constructor(protected authService: AuthService, protected http: HttpClient, protected toast: ToastrService) { }

  @Input() notification: any;

  ngOnInit(): void {
  }

  set_notification_as_seen(id: string){
    this.http.delete(environment.ws + '/notifications/' + id, {
      headers: {
        version: '2',
        authorization: this.authService.token_value
      }
    }).subscribe((response) => {
      this.toast.success('Notification Marked as seen !')
    })
  }

  format_date(date: any){
    return moment(date).fromNow();
  }

}
