import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndexRoutingModule } from './index-routing.module';
import { IndexComponent } from './index.component';
import { NumbersBannerComponent } from './numbers-banner/numbers-banner.component';
import { NumberElementComponent } from './numbers-banner/number-element/number-element.component';
import { CreditComponent } from './credit/credit.component';
import { ResourceModule } from '../resource/resource.module';
import { RouterModule } from '@angular/router';
// import { DatabasesModule } from '../databases/databases.module';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { PostAuthPageComponent } from './post-auth/post-auth-page/post-auth-page.component';


@NgModule({
  declarations: [
    NumbersBannerComponent,
    IndexComponent,
    NumberElementComponent,
    CreditComponent,
    PostAuthPageComponent,
  ],
  imports: [
    // DatabasesModule,
    FormsModule,
    CommonModule,
    IndexRoutingModule,
    RouterModule,
    AngularSvgIconModule,
    ResourceModule
  ],
  exports: [
    IndexComponent,
  ]
})
export class IndexModule { }
