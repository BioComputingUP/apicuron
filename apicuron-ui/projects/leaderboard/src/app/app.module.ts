import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import  { createCustomElement } from '@angular/elements';
import { AppComponent } from './app.component';
import { LeaderboardComponent } from '../../../../src/app/components/leaderboard/leaderboard.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LeaderboardComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    const el = createCustomElement(LeaderboardComponent, { injector });
    customElements.define('apicuron-leaderboard', el);
  }
}
