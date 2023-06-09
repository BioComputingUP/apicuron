import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: "reward-card",
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule],
  template: `
    <div
      class="tw-shadow-md tw-p-1 tw-bg-white tw-rounded tw-flex tw-flex-row tw-justify-between tw-items-center"
    >
      <div class="tw-flex tw-flex-row tw-items-center">
        <svg-icon
          [src]="icon_src"
          svgClass="tw-w-12 tw-h-12"
          [svgStyle]="{ color: color }"
        ></svg-icon>
        <span class="tw-text-xl tw-font-bold tw-pl-1" [ngStyle]="{ color: color }">{{
          value_text
        }}</span>
      </div>
      <span class="tw-block tw-font-bold tw-text-gray-500 tw-text-sm tw-text-right">{{
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
