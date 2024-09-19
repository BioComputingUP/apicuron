// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { bootstrapApplication, createApplication } from "@angular/platform-browser"
import { LeaderboardComponent } from "../../leaderboard-lib/src/lib/leaderboard/leaderboard.component"
import { NgZone, importProvidersFrom } from "@angular/core"
import { CommonModule } from "@angular/common"
import { CuratorStatisticsModule } from "../../../src/app/curator-statistics/curator-statistics.module"
import { ResourceModule } from "../../../src/app/resource/resource.module"
import { CuratorModule } from "../../../src/app/curator/curator.module"
import { AngularSvgIconModule } from "angular-svg-icon"
import { ReactiveFormsModule } from "@angular/forms"
import { createCustomElement } from "@angular/elements"

import { AppModule } from './app/app.module';
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));



// (async () => {
//   // const app = await bootstrapApplication(LeaderboardComponent, {
//   //   providers: [importProvidersFrom(CommonModule, CuratorStatisticsModule, ResourceModule, CuratorModule, AngularSvgIconModule, ReactiveFormsModule)]
//   // })

//   const app = await createApplication({
//     providers: [importProvidersFrom(CommonModule, CuratorStatisticsModule, ResourceModule, CuratorModule, AngularSvgIconModule, ReactiveFormsModule)],
//   })

//   app.injector.get(NgZone).run(() => {
//     app.bootstrap(LeaderboardComponent, 'apicuron-leaderboard')
//   })

//   const leaderboardElement = createCustomElement(LeaderboardComponent,{
//     injector: app.injector
//   })

//   customElements.define('apicuron-leaderboard', leaderboardElement);

// })