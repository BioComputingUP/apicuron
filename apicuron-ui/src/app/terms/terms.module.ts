import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { TermsService } from "./services/terms.service";
import { RouterModule } from "@angular/router";



@NgModule({
    imports: [HttpClientModule, RouterModule],
    providers: [TermsService]
})
export class TermsModule {

}