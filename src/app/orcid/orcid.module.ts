import { OverlayModule } from "@angular/cdk/overlay";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { forwardRef, NgModule } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { OrcidService } from "src/app/orcid/services/orcid.service";
import { OrcidSearchSelectComponent } from "./components/orcid-search-select/orcid-search-select.component";
import { CuratorBadge } from "./components/curator-badge/curator-badge.component";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { LoadableComponent } from "../../../projects/apicuron-util/src/lib/loadable";

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    AngularSvgIconModule,
    LoadableComponent,
    OverlayModule,
  ],
  providers: [OrcidService],
  declarations: [OrcidSearchSelectComponent, CuratorBadge],
  exports: [OrcidSearchSelectComponent],
})
export class OrcidModule {}
