import { bootstrapApplication, createApplication } from "@angular/platform-browser"
import { LeaderboardComponent } from "src/app/components/leaderboard/leaderboard.component"
import { createCustomElement } from '@angular/elements'
import { environment } from "src/environments/environment";
import { enableProdMode, importProvidersFrom } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CuratorStatisticsModule } from "src/app/curator-statistics/curator-statistics.module";
import { CuratorModule } from "src/app/curator/curator.module";
import { AngularSvgIconModule } from "angular-svg-icon";
import { ReactiveFormsModule } from "@angular/forms";



async function bootstrap() {

    if (environment.production) {
        enableProdMode();
    }


    const app = await bootstrapApplication(
        LeaderboardComponent,
        {
            // providers: [importProvidersFrom(CommonModule, CuratorStatisticsModule, CuratorModule, AngularSvgIconModule.forRoot(), ReactiveFormsModule)]
            providers: []
        })

    const leaderboardElement = createCustomElement(LeaderboardComponent, { injector: app.injector, })

    customElements.define('apicuron-leaderboard', leaderboardElement)

}

bootstrap();