import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndexRoutingModule } from './index-routing.module';
import { IndexComponent } from './index.component';
import { NumbersBannerComponent } from './numbers-banner/numbers-banner.component';
import { NumberElementComponent } from './numbers-banner/number-element/number-element.component';
import { CreditComponent } from './credit/credit.component';
import { ResourceModule } from '../resource/resource.module';


@NgModule({
  declarations: [
    NumbersBannerComponent,
    IndexComponent,
    NumberElementComponent,
    CreditComponent
  ],
  imports: [
    CommonModule,
    IndexRoutingModule,
    ResourceModule
  ]
})
export class IndexModule { }
