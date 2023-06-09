import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { OrcidService } from "src/app/orcid/services/orcid.service";



@NgModule({
    imports: [
        CommonModule,
        HttpClientModule
    ],
    providers: [OrcidService],
    // exports: [OrcidService]
})
export class OrcidModule {

}