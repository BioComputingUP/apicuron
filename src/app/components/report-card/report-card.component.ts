import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { Term } from "src/app/models/term.model";
import { Report } from "src/app/models/report.model";
import * as _ from "lodash";
import { NgxPopperModule } from "ngx-popper";

@Component({
    standalone: true,
    imports: [CommonModule, NgxPopperModule],
    selector: 'report-card',
    templateUrl: './report-card.component.html'
})
export class ReportCardComponent {

    constructor() {
    }

    @Input() report: Report;

    @Input() term: Term;

    @Input() truncate_description: Boolean = true;


    categoryColor() {
        const converter = {
            'tw-text-green-100 tw-bg-green-500': 'generation',
            'tw-text-orange-100 tw-bg-orange-500': 'revision',
            'tw-text-red-100 tw-bg-red-500': 'invalidation',
        }

        return _.mapValues(converter, (category) => category == this.term.category)
    }

}