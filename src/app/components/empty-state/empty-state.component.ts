import { Component, Input, OnInit } from "@angular/core";

@Component({
  standalone: true,
  selector: "empty-state",
  templateUrl: "./empty-state.component.html",
})
export class EmptyStateComponent implements OnInit {
  constructor() {}

  @Input() type?: string = "element";
  ngOnInit(): void {}
}
