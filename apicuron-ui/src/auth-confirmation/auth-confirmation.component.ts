import { CommonModule } from "@angular/common";
import { Component, ViewEncapsulation } from "@angular/core";
import { NavbarComponent } from "../app/alt-navbar/alt-navbar.component";
import { NotificationsModule } from "src/app/notifications/notifications.module";
import { NotificationsDataModule } from "src/app/notifications-data/notifications-data.module";
import { ToastrModule } from "ngx-toastr";
import { environment } from "src/environments/environment";

@Component({
  selector: "oauth-response-root",
  imports: [
    CommonModule,
    NavbarComponent,
    NotificationsModule,
    NotificationsDataModule,
    ToastrModule,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./auth-confirmation.component.html",
  styleUrls: ["./auth-confirmation.component.scss"],
  standalone: true,
})
export class AuthConfirmationComponent {
  constructor() {
    const accessTokenElement: HTMLMetaElement = document.head.querySelector(
      "[name=access_token][content]"
    );

    const msg = {
      access_token: accessTokenElement.content,
    };
    console.log(msg);

    [environment.ws, environment.host].map((url: string) => {
        const origin =  new URL(url).origin;
        window?.opener.postMessage(msg, origin);
    })

  }
}
