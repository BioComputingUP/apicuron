import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { AuthModule } from '../auth/auth.module';
import { NotificationComponent } from './notification/notification.component';


@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationComponent
  ],
  imports: [
    CommonModule,
    AuthModule,
    NotificationsRoutingModule
  ]
})
export class NotificationsModule { }
