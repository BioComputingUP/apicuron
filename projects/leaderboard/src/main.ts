// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from "./app/app.module";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

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
