import { DoBootstrap, Injector, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { createCustomElement } from "@angular/elements";
import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { LeaderboardModule } from "../../../apicuron-util/src/lib/leaderboard/leaderboard.module";
import { AngularSvgIconModule } from "angular-svg-icon";
import { environment } from "../../../../src/environments/environment";
import { RouterModule } from "@angular/router";
import { WrapperComponent } from "./wrapper.component";

@NgModule({
  declarations: [WrapperComponent],
  imports: [
    CommonModule,
    BrowserModule,
    LeaderboardModule,
    AngularSvgIconModule.forRoot(),
    RouterModule.forRoot([]),
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: environment.host,
    },
  ],
})
export class AppModule implements DoBootstrap {
  constructor(protected injector: Injector) {}

  ngDoBootstrap(): void {
    const el = createCustomElement(WrapperComponent, {
      injector: this.injector,
    });
    customElements.define("apicuron-leaderboard", el);
  }
}
