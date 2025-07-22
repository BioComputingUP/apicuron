import { NgModule } from "@angular/core";
import { NotificationService } from "./notification.service";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";


@NgModule({
    imports: [CommonModule, RouterModule],
    providers: [NotificationService]
})
export class NotificationsDataModule {

}