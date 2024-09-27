import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { BehaviorSubject, Subject } from "rxjs";
import { filter, map, startWith, takeUntil, tap } from "rxjs/operators";
import { SelectMultipleComponent } from "src/app/components/utils/multiple-select/select-multiple.component";
import { Term } from "src/app/models/term.model";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";

@Component({
  standalone: true,
  selector: "report-filter-form",
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectMultipleComponent,
  ],
  templateUrl: "./report-filter-form.component.html",
  styleUrls: [],
})
export class ReportFilterFormComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<boolean>();

  constructor(protected fb: FormBuilder) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  @Input() defaultFilter: ReportFilter = ReportFilter.create({
    from: null,
    to: new Date(),
    sortBy: "timestamp",
    sortOrder: -1,
    activity_terms: [],
  });

  terms$: BehaviorSubject<Term[]> = new BehaviorSubject<Term[]>([]);

  ngOnInit(): void {
    this.form = this.fb.group({
      from: [this.defaultFilter.from],
      to: [this.defaultFilter.to],
      sortBy: [
        this.defaultFilter.sortBy,
        Validators.pattern(/^(timestamp|activity_term)$/),
      ],
      sortOrder: [this.defaultFilter.sortOrder, Validators.pattern(/^(1|-1)$/)],
      activity_terms: [this.defaultFilter.activity_terms],
    });

    this.form.valueChanges
      .pipe(
        // but it will always start with this.form
        map(() => this.form),
        // and later switch to the form Observable
        filter((form: FormGroup) => form.valid),
        map((form: FormGroup) => ReportFilter.create(form.value)),
        tap((filter: ReportFilter) => this.reportFilter.emit(filter)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {});
  }

  form: FormGroup;

  @Input()
  get terms(): Term[] {
    return this.terms$.value;
  }
  set terms(value: Term[]) {
    if (!!value && value != null) {
      this.terms$.next(value);
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
      return this.terms.map((term) => term.itemize());
    }
    return [];
  }
}
