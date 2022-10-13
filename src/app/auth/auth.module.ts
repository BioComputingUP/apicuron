import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { AuthDropdownComponent } from './auth-dropdown/auth-dropdown.component';
import { AuthGuard } from './auth.guard';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    AuthDropdownComponent
  ],
  providers: [AuthService, AuthGuard],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    AuthDropdownComponent
  ]
})
export class AuthModule { }
