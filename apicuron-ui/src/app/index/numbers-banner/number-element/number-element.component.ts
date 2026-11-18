import { Component, Input } from "@angular/core";

/** One figure of the numbers band: icon (projected), count and label */
@Component({
  selector: "app-number-element",
  templateUrl: "./number-element.component.html",
  styleUrls: ["./number-element.component.scss"],
})
export class NumberElementComponent {
  @Input() text = "";
  @Input() count = 0;
}
