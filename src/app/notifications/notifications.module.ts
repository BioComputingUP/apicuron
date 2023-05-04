import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { NotificationComponent } from './notification/notification.component';
import { AngularSvgIconModule } from 'angular-svg-icon';


@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationComponent
  ],
  imports: [
    NotificationsRoutingModule,
    AngularSvgIconModule,
    CommonModule
  ]
})
export class NotificationsModule { }
