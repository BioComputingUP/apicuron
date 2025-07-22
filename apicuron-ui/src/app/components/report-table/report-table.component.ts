import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Report } from "src/app/models/report.model";
import { Term } from "src/app/models/term.model";



@Component({
    selector: 'report-table',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './report-table.component.html',
    styleUrls: []
})
export class ReportTableComponent {

    @Input()
    reports: Report[];

}