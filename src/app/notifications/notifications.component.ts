import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, pluck } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import * as moment from "moment";
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<any[]>;
  notificationsSubject$:BehaviorSubject<any[]>;

  constructor(protected authService: AuthService, protected http: HttpClient, protected toast: ToastrService) {
    this.notificationsSubject$ = new BehaviorSubject([]);
    
    this.notifications$ = this.authService.user$.pipe(pluck('notifications'));

    this.notifications$.subscribe((notifications) => {
      this.notificationsSubject$.next(notifications)
    })
  }


  removeNotification(id: any){
    const notifications = this.notificationsSubject$.getValue().filter(
      (notification => notification._id != id)
    );

    this.notificationsSubject$.next(notifications);
  }



  ngOnInit(): void {
  }

}
