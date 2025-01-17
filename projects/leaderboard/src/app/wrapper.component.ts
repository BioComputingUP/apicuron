import { Component, Input, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "wrapper-leaderboard",
  template:
    '<resource-leaderboard [resource]="resource" [options]="options"></resource-leaderboard>',
  styleUrls: ["../styles.scss"],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class WrapperComponent {
  @Input() resource: any = undefined;
  @Input() options: any = undefined;
}
