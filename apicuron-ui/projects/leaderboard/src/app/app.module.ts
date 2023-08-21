import { ApplicationRef, DoBootstrap, Inject, Injector, NgModule } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { AppComponent } from './app.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { CommonModule } from '@angular/common';
import { CuratorStatisticsModule } from '../../../../src/app/curator-statistics/curator-statistics.module';
import { ResourceModule } from '../../../../src/app/resource/resource.module';
import { CuratorModule } from '../../../../src/app/curator/curator.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MainService } from './main.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    LeaderboardComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    AngularSvgIconModule.forRoot(),
    ReactiveFormsModule,
  ],
  providers: [
    { provide: 'WS', useValue: 'https://dev.apicuron.org/api/' },
    MainService
  ],
})
export class AppModule implements DoBootstrap {

  constructor(protected injector: Injector) { }


  ngDoBootstrap(): void {
    const el = createCustomElement(LeaderboardComponent, { injector: this.injector });
    customElements.define('apicuron-leaderboard', el);
  }

}
