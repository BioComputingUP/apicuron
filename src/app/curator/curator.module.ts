import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CuratorProfileComponent } from '../components/curator-profile/curator-profile.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { SvgModule } from '../svg/svg.module';
import { CuratorCardComponent } from './curator-card/curator-card.component';
import { CuratorPageComponent } from './curator-page/curator-page.component';
import { CuratorPageService } from './curator-page/curator-page.service';
import { CuratorRoutingModule } from './curator-routing.module';
import { CuratorSearchComponent } from './curator-search/curator-search.component';
import { CuratorService } from './curator.service';
import { CuratorsPageComponent } from './curators-page.component';

import { HttpClientModule } from '@angular/common/http';
import { AchievementsModule } from '../achievements/achievements.module';
import { CuratorStatCardComponent } from '../components/curator-stat-card/curator-stat-card.component';
import { CuratorStatisticsModule } from '../curator-statistics/curator-statistics.module';
import { SharedUtilsModule } from '../shared/shared-utils.module';
@NgModule({
  declarations: [
    CuratorCardComponent,
    CuratorsPageComponent,
    CuratorSearchComponent,
    CuratorPageComponent,
    
  ],
  imports: [
    SharedUtilsModule,
    SvgModule,
    HttpClientModule,
    PaginationComponent,
    CuratorProfileComponent,
    CuratorStatCardComponent,
    CommonModule,
    AchievementsModule,
    CuratorStatisticsModule,
    FormsModule,
    AngularSvgIconModule,
    ReactiveFormsModule,
    CuratorRoutingModule,
  ],
  providers:[CuratorService, CuratorPageService],
  exports: [
    CuratorCardComponent,
    CuratorSearchComponent
  ]
})
export class CuratorModule {}
