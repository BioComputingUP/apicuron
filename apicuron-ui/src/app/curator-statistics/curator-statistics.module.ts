import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CuratorStatisticsService } from "./services/curator-statistics.service";
import { HttpClientModule } from "@angular/common/http";


@NgModule({
    imports: [CommonModule, HttpClientModule],
    providers: [CuratorStatisticsService],
    exports: []
})
export class CuratorStatisticsModule {

}