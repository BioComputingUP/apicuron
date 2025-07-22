import { HttpClientModule } from "@angular/common/http";
import { enableProdMode, importProvidersFrom } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { RouterModule } from "@angular/router";
import { AngularSvgIconModule } from "angular-svg-icon";
import { ToastrModule } from "ngx-toastr";
import { NotificationsDataModule } from "src/app/notifications-data/notifications-data.module";
import { NotificationsModule } from "src/app/notifications/notifications.module";
import { AuthConfirmationComponent } from "src/auth-confirmation/auth-confirmation.component";
import { environment } from "src/environments/environment";

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AuthConfirmationComponent, {
  providers: [
    importProvidersFrom(
      RouterModule.forRoot([]),
      HttpClientModule,
      ToastrModule.forRoot(),
      AngularSvgIconModule.forRoot(),
    ),
    AuthConfirmationComponent,
  ],
  
})
  .then((success) => console.log(`Bootstrap success`))
  .catch((err) => console.error(err));
