import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Term } from "../../../models/term.model";
import * as _ from "lodash";
import { Selectable } from "projects/apicuron-util/src/lib/selectable/selectable.component";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "activity-list-element",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./activity-list-element.component.html",
  styleUrls: ["./activity-list-element.component.scss"],
})
export class ActivityListElementComponent extends Selectable implements OnInit {
  constructor() {
    super();
  }

  @Input()
  term: Term;

  converter = {
    generation: "tw-text-green-100 tw-bg-generation",
    revision: "tw-text-orange-100 tw-bg-revision",
    invalidation: "tw-text-red-100 tw-bg-invalidation",
  };

  scoreColor() {
    return "tw-bg-gray-200 tw-text-gray-600";
  }

  categoryClasss: string;

  ngOnInit(): void {
    this.categoryClasss = this.converter[this.term.category];
  }
}
