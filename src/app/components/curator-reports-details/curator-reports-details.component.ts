import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AngularSvgIconModule } from "angular-svg-icon";
import { BehaviorSubject, Observable, combineLatest, of } from "rxjs";
import { filter, map, shareReplay, startWith, switchMap, tap } from "rxjs/operators";
import { ReportCardComponent } from "src/app/components/report-card/report-card.component";
import { ReportFilterFormComponent } from "src/app/components/report-filter-form/report-filter-form.component";
import { ReportTableComponent } from "src/app/components/report-table/report-table.component";
import { SelectMultipleComponent } from "src/app/components/utils/multiple-select/select-multiple.component";
import { Paginated } from "src/app/interfaces/paginated";
import { User } from "src/app/models/User.model";
import { Report } from "src/app/models/report.model";
import { Resource } from "src/app/models/resource.model";
import { Term } from "src/app/models/term.model";
import { PaginationComponent } from "src/app/pagination/pagination.component";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { ReportsModule } from "src/app/reports/reports.module";
import { ReportsService } from "src/app/reports/services/reports.service";



@Component({
    standalone: true,
    selector: 'curator-stat-details',
    imports: [CommonModule, ReportFilterFormComponent, ReportCardComponent, ReportTableComponent, ReportsModule, AngularSvgIconModule, PaginationComponent],
    templateUrl: './curator-reports-details.component.html',
    styleUrls: []
})
export class CuratorStatDetailsComponent implements OnInit {

    constructor(protected formBuilder: FormBuilder, protected reportsService: ReportsService) { }

    // handle terms prop reactivity
    terms$: BehaviorSubject<Term[]> = new BehaviorSubject<Term[]>([]);
    reportsWithTerms$: Observable<{ data: Report[], total_count: Number, page: Number, page_size: Number }>;

    paginatedReports$: Observable<Paginated<Report>>;
    reportFilter$: BehaviorSubject<ReportFilter> = new BehaviorSubject<ReportFilter>(null);


    get currentPage (){
        return this.reportFilter$.value.page
    }
    set currentPage(value){
        this.update_page(value)
    }

    update_page(page) {
        const filter = this.reportFilter$.value
        filter.page = page
        this.reportFilter$.next(filter)
    }


    viewType: 'table' | 'grid' = 'grid';

    ngOnInit(): void {

        this.reportFilter$.next(ReportFilter.create({
            resource_id: this.resource.resource_id,
            curator_orcid: this.curator.orcid_id,
            page: 1,
            page_size: 20
        }))

        this.paginatedReports$ = this.reportFilter$.pipe(
            filter((filter) => !!filter),
            switchMap((reportFilter: ReportFilter) => {
                return this.reportsService.getReports(reportFilter);
            }),
            shareReplay()
        )
        
        this.reportsWithTerms$ = combineLatest([this.paginatedReports$, this.terms$]).pipe(
            filter(([reports, terms]) => terms.length > 0),
            map(([reports, terms]: [Paginated<Report>, Term[]]) => {
                const { total_count, page, page_size }= reports
                const data = reports.data.map((report) => {
                    report.term = terms.find((term) => term.activity_term === report.activity_term)
                    return report
                })
                return { data, total_count, page, page_size }
            }),
        )
    }

    @Input() curator: User;
    @Input() resource: Resource;

    @Input()
    get terms(): Term[] {
        return this.terms$.value
    }
    set terms(value: Term[]){
        if(!!value && value != null){
            this.terms$.next(value)
        }
    }

}