import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { Term } from "src/app/models/term.model";
import { Report } from "../../models/report.model";
import * as _ from "lodash";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule,MatTooltipModule],
  selector: "report-card",
  templateUrl: "./report-card.component.html",
})
export class ReportCardComponent {
  constructor() {}

  @Input() report: Report;

  @Input() term: Term;

  @Input() truncate_description: Boolean = true;

  categoryColor() {
    const converter = {
      "tw-text-green-100 tw-bg-generation": "generation",
      "tw-text-orange-100 tw-bg-revision": "revision",
      "tw-text-red-100 tw-bg-invalidation": "invalidation",
    };

    return _.mapValues(converter, (category) => category == this.term.category);
  }
}
