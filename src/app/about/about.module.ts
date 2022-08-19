import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';


@NgModule({
  declarations: [
    AboutComponent
  ],
  imports: [
    CommonModule,
    ScrollToModule.forRoot(),
    AboutRoutingModule
  ]
})
export class AboutModule { }
