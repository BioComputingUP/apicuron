import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuratorCardComponent } from './curator-card/curator-card.component';
import { CuratorRoutingModule } from './curator-routing.module';
import { CuratorsPageComponent } from './curators-page.component';
import { CuratorSearchComponent } from './curator-search/curator-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CuratorPageComponent } from './curator-page/curator-page.component';
import { SvgModule } from '../svg/svg.module';
import { CuratorStatComponent } from './curator-stat/curator-stat.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { CuratorService } from './curator.service';
import { CuratorPageService } from './curator-page/curator-page.service';

@NgModule({
  declarations: [
    CuratorCardComponent,
    CuratorsPageComponent,
    CuratorSearchComponent,
    CuratorPageComponent,
    CuratorStatComponent,
    PaginationComponent
  ],
  imports: [
    SvgModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CuratorRoutingModule,
  ],
  providers:[CuratorService, CuratorPageService],
  exports: [
    CuratorCardComponent
  ]
})
export class CuratorModule { }
