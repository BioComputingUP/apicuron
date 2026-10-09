import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OrcidButtonComponent } from '../components/orcid-button/orcid-button.component';


@NgModule({
  declarations: [
    AboutComponent
  ],
  imports: [
    CommonModule,
    AboutRoutingModule,
    AngularSvgIconModule,
    OrcidButtonComponent
  ]
})
export class AboutModule { }
