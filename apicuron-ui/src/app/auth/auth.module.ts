import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "./auth.service";
import { AuthDropdownComponent } from "../components/auth-dropdown/auth-dropdown.component";
import { AuthGuard } from "./auth.guard";
// import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AngularSvgIconModule } from "angular-svg-icon";
import { AuthInterceptor } from "./auth.interceptor";

@NgModule({
  // declarations: [
  //   AuthDropdownComponent
  // ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthGuard,
  ],
  imports: [
    CommonModule,
    AngularSvgIconModule,
    // RouterModule
  ],
  // exports: [
  //   AuthDropdownComponent
  // ]
})
export class AuthModule {}
