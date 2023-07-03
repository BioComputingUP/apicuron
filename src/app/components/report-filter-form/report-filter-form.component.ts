import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map, startWith, switchMap } from "rxjs/operators";
import { SelectMultipleComponent } from "src/app/components/utils/multiple-select/select-multiple.component";
import { User } from "src/app/models/User.model";
import { Resource } from "src/app/models/resource.model";
import { Term } from "src/app/models/term.model";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";



@Component({
    standalone: true,
    selector: 'report-filter-form',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectMultipleComponent],
    templateUrl: './report-filter-form.component.html',
    styleUrls: []
})
export class ReportFilterFormComponent implements OnInit, OnDestroy {

    @Input() resource: Resource;
    @Input() curator: User;
    formValueSubscription;

    constructor(protected formBuilder: FormBuilder) {
        this.form = this.formBuilder.group({})
    }


    ngOnDestroy(): void {
        this.formValueSubscription.unsubscribe()
    }


    form$: BehaviorSubject<FormGroup> = new BehaviorSubject(null)
    terms$: BehaviorSubject<Term[]> = new BehaviorSubject<Term[]>([]);

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            resource_id: [this.resource?.resource_id || null],
            curator_orcid: [this.curator?.orcid_id || null],
            from: [null],
            to: [new Date()],
            sortBy: ['timestamp', Validators.pattern(/^(timestamp|activity_term)$/)],
            sortOrder: ['desc', Validators.pattern(/^(asc|desc|1|0)$/)],
            activity_terms: [[]],
            page_size: [20],
            page: [1]
        })

        
        this.formValueSubscription = this.form.valueChanges.pipe(
            // but it will always start with this.form
            startWith(this.form),
            // and later switch to the form Observable
            switchMap(() => this.form$),
            filter((form: FormGroup) => form.valid),
            map((form: FormGroup) => ReportFilter.create(form.value))
        ).subscribe((reportFilter: ReportFilter) => {
            this.reportFilter.emit(reportFilter)
        })
    }
    
    get form() {
        return this.form$.value
    }
    set form(value: FormGroup) {
        this.form$.next(value)
    }

    @Input()
    get terms(): Term[] {
        return this.terms$.value
    }
    set terms(value: Term[]){
        if(!!value && value != null){
            this.terms$.next(value)
        }
    }

    @Output()
    reportFilter: EventEmitter<ReportFilter> = new EventEmitter();

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