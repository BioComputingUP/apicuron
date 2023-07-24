import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CuratorStatisticsService } from "./services/curator-statistics.service";


@NgModule({
    imports: [CommonModule],
    providers: [CuratorStatisticsService],
    exports: []
})
export class CuratorStatisticsModule {

}