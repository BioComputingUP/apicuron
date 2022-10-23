import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { AuthDropdownComponent } from './auth-dropdown/auth-dropdown.component';
import { AuthGuard } from './auth.guard';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';



@NgModule({
  declarations: [
    AuthDropdownComponent
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthService, multi: true },
    AuthGuard],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    AuthDropdownComponent
  ]
})
export class AuthModule { }
