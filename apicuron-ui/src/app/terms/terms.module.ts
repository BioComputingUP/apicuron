import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { TermsService } from "src/app/terms/services/terms.service";



@NgModule({
    imports: [HttpClientModule],
    providers: [TermsService]
})
export class TermsModule {

}