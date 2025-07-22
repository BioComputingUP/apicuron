import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ReportsService } from "src/app/reports/services/reports.service";



@NgModule({
    imports: [HttpClientModule],
    providers: [ReportsService],
})
export class ReportsModule {

}