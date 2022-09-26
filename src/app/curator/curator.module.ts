import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuratorCardComponent } from './curator-card/curator-card.component';
import { CuratorRoutingModule } from './curator-routing.module';
import { CuratorsPageComponent } from './curators-page.component';
import { CuratorSearchComponent } from './curator-search/curator-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CuratorPageComponent } from './curator-page/curator-page.component';
import { SvgModule } from '../svg/svg.module';
import { CuratorStatComponent } from './curator-stat/curator-stat.component';

@NgModule({
  declarations: [
    CuratorCardComponent,
    CuratorsPageComponent,
    CuratorSearchComponent,
    CuratorPageComponent,
    CuratorStatComponent
  ],
  imports: [
    PaginationModule.forRoot(),
    SvgModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CuratorRoutingModule
  ],
  exports: [
    CuratorCardComponent
  ]
})
export class CuratorModule { }
