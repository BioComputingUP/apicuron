import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: "reward-card",
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule],
  template: `
    <div
      class="tw-shadow-md tw-p-1 tw-bg-white tw-rounded tw-flex tw-flex-row tw-justify-between tw-items-center tw-flex-wrap sm:tw-flex-nowrap"
    >
      <div class="tw-flex sm:tw-flex-row tw-flex-col tw-items-center tw-justify-center sm:tw-justify-normal tw-w-full sm:tw-w-auto">
        <svg-icon
          [src]="icon_src"
          svgClass="tw-w-12 tw-h-12"
          [svgStyle]="{ color: color }"
        ></svg-icon>
        <span class="tw-text-xl tw-font-bold tw-pl-1" [ngStyle]="{ color: color }">{{
          value_text
        }}</span>
      </div>
      <span class="tw-w-full tw-block tw-font-bold tw-text-gray-500 tw-text-sm tw-text-center sm:tw-text-right tw-order-first sm:tw-order-last">{{
        label_text
      }}</span>
    </div>
  `,
  styles: [],
})
export class RewardCardComponent {
  @Input() icon_src: string;
  @Input() color: string;
  @Input() value_text: string;
  @Input() label_text: string;
}
