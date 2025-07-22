import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  standalone: true,
  selector: "spinner",
  imports: [CommonModule, AngularSvgIconModule],
  template: `
    <div
      class="tw-rounded tw-p-2 tw-flex tw-items-center tw-h-full tw-justify-center"
    >
      <svg-icon
        svgClass="tw-w-16 tw-h-16 md:tw-w-24 md:tw-h-24 tw-text-apicuron-purple tw-animate-spin"
        src="assets/svg/loading-spinner.svg"
      ></svg-icon>
    </div>
  `,
})
export class SpinnerComponent {}
