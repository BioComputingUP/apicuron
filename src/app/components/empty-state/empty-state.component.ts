import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: "empty-state",
  templateUrl: "./empty-state.component.html",
})
export class EmptyStateComponent implements OnInit {
  constructor() {}

  @Input() type?: string = "element";
  @Input() src?: string = "";
  ngOnInit(): void {}
}
