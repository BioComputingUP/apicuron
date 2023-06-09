import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Term } from "src/app/models/term.model";


@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'report-card',
    templateUrl: './report-card.component.ts'
})
export class ReportCardComponent {
    
    constructor() {}

    @Input() report: Report;

    @Input() term: Term;
    
}