import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: "empty-state",
  templateUrl: "./empty-state.component.html",
})
export class EmptyStateComponent {
  @Input() type: string = "element";
  @Input() src: string = "";

  showFallback: boolean = false;

  handleImgError(): void {
    this.showFallback = true;
  }
}
