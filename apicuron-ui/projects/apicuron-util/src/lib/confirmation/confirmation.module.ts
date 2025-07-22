import { NgModule } from "@angular/core";
import { ConfirmationComponent } from "./confirmation.component";
import { ConfirmationService } from "./services/confirmation.service";
import { DialogModule } from "@angular/cdk/dialog";
import { AngularSvgIconModule } from "angular-svg-icon";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [ConfirmationComponent],
  imports: [CommonModule, DialogModule, AngularSvgIconModule],
  providers: [ConfirmationService],
})
export class ConfirmationModule {}
