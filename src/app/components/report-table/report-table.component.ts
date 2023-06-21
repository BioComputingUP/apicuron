import { CommonModule } from "@angular/common";
import { Component, Injectable, Input } from "@angular/core";
import { Term } from "src/app/models/term.model";
import { PaginatedReportsWithTerms } from "src/app/reports/interfaces/paginated-reports.interface";



@Component({
    selector: 'report-table',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './report-table.component.html',
    styleUrls: []
})
export class ReportTableComponent {

    @Input()
    reports: PaginatedReportsWithTerms;

}