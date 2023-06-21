import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { BehaviorSubject, Observable, combineLatest, of } from "rxjs";
import { filter, map, startWith, switchMap, tap } from "rxjs/operators";
import { ReportCardComponent } from "src/app/components/report-card/report-card.component";
import { SelectMultipleComponent } from "src/app/components/utils/multiple-select/select-multiple.component";
import { User } from "src/app/models/User";
import { Report } from "src/app/models/report.model";
import { Resource } from "src/app/models/resource.model";
import { Term } from "src/app/models/term.model";
import { PaginatedReports, PaginatedReportsWithTerms } from "src/app/reports/interfaces/paginated-reports.interface";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { ReportsModule } from "src/app/reports/reports.module";
import { ReportsService } from "src/app/reports/services/reports.service";



@Component({
    standalone: true,
    selector: 'curator-stat-details',
    imports: [CommonModule, ReactiveFormsModule, SelectMultipleComponent, ReportCardComponent, ReportsModule],
    templateUrl: './curator-stat-details.component.html',
    styleUrls: []
})
export class CuratorStatDetailsComponent implements OnInit {
    reportsWithTerms$: Observable<PaginatedReportsWithTerms>;

    constructor(protected formBuilder: FormBuilder, protected reportsService: ReportsService) { }

    get form() {
        return this.form$.value
    }
    set form(value: FormGroup) {
        this.form$.next(value)
    }
    form$: BehaviorSubject<FormGroup> = new BehaviorSubject(null)
    terms$: BehaviorSubject<Term[]> = new BehaviorSubject<Term[]>([]);
    paginatedReports$: Observable<PaginatedReports>;


    ngOnInit(): void {
        this.form = this.formBuilder.group({
            resource_id: [this.resource.resource_id],
            curator_orcid: [this.curator.orcid_id],
            from: [null],
            to: [new Date()],
            sortBy: ['timestamp', Validators.pattern(/^(timestamp|activity_term)$/)],
            sortOrder: ['desc', Validators.pattern(/^(asc|desc|1|0)$/)],
            activity_terms: [[]],
            page_size: [20],
            page: [1]
        })

        // this Observable is only triggerred when the form changes, (continue below)
        this.paginatedReports$ = this.form.valueChanges.pipe(
            // but it will always start with this.form
            startWith(this.form),
            // and later switch to the form Observable
            switchMap(() => this.form$),
            filter((form: FormGroup) => form.valid),
            switchMap((form: FormGroup) => {
                const reportFilter = ReportFilter.create(form.value)
                return this.reportsService.getReports(reportFilter)
            })
        )

        this.reportsWithTerms$ = combineLatest([this.paginatedReports$, this.terms$]).pipe(
            filter(([reports, terms]) => terms.length > 0),
            map(([reports, terms]: [PaginatedReports, Term[]]) => {
                const { total_count, page, page_size }= reports
                const data = reports.data.map((report) => {
                    return {
                        term: terms.find((term) => term.activity_term === report.activity_term),
                        report
                    }
                })
                return { data, total_count, page, page_size }
            }),
            tap(console.log)
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

    sortFields = [
        {
            value: "timestamp",
            text: "Date",
        },
        {
            value: "activity_term",
            text: "Activity",
        },
    ];



    get itemizedTerms() {
        if (this.terms) {
            return this.terms.map((term) => term.itemize())
        }
        return []
    }


}