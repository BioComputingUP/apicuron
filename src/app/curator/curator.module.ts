import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuratorCardComponent } from './curator-card/curator-card.component';
import { CuratorRoutingModule } from './curator-routing.module';
import { CuratorsPageComponent } from './curators-page.component';
import { CuratorSearchComponent } from './curator-search/curator-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CuratorPageComponent } from './curator-page/curator-page.component';
import { SvgModule } from '../svg/svg.module';
import { PaginationComponent } from '../pagination/pagination.component';
import { CuratorService } from './curator.service';
import { CuratorPageService } from './curator-page/curator-page.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CuratorProfileComponent } from '../components/curator-profile/curator-profile.component';
import { CuratorStatCardComponent } from 'src/app/components/curator-stat-card/curator-stat-card.component';
import { CuratorStatisticsModule } from 'src/app/curator-statistics/curator-statistics.module';
import { AchievementsModule } from 'src/app/achievements/achievements.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    CuratorCardComponent,
    CuratorsPageComponent,
    CuratorSearchComponent,
    CuratorPageComponent,
    
  ],
  imports: [
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
    CuratorCardComponent
  ]
})
export class CuratorModule {}
