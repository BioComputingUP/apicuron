import {
  DoBootstrap, Injector,
  NgModule
} from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { createCustomElement } from "@angular/elements";
import { LeaderboardComponent } from "./leaderboard/leaderboard.component";
import { CommonModule } from "@angular/common";
import { MainService } from "./main.service";
import { LeaderboardModule } from "../../../apicuron-util/src/lib/leaderboard/leaderboard.module";
import { ResourceLeaderboardComponent } from "../../../apicuron-util/src/lib/leaderboard/resource-leaderboard.component";

@NgModule({
  declarations: [LeaderboardComponent],
  imports: [CommonModule, BrowserModule, LeaderboardModule],
  providers: [MainService],
})
export class AppModule implements DoBootstrap {
  constructor(protected injector: Injector) {}

  ngDoBootstrap(): void {
    const el = createCustomElement(ResourceLeaderboardComponent, {
      injector: this.injector,
    });
    customElements.define("apicuron-leaderboard", el);
  }
}
