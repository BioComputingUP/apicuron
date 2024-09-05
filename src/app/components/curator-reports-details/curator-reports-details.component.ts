import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { AngularSvgIconModule } from "angular-svg-icon";
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  combineLatest,
  of,
} from "rxjs";
import { filter, map, shareReplay, switchMap, tap } from "rxjs/operators";
import { ReportCardComponent } from "src/app/components/report-card/report-card.component";
import { ReportFilterFormComponent } from "src/app/components/report-filter-form/report-filter-form.component";
import { ReportTableComponent } from "src/app/components/report-table/report-table.component";
import { Paginated } from "src/app/interfaces/paginated";
import { User } from "src/app/models/User.model";
import { Report } from "src/app/models/report.model";
import { Resource } from "src/app/models/resource.model";
import { Term } from "src/app/models/term.model";
import { PaginationComponent } from "src/app/pagination/pagination.component";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { ReportsModule } from "src/app/reports/reports.module";
import { ReportsService } from "src/app/reports/services/reports.service";
import { TermsService } from "../../terms/services/terms.service";
import { TermsModule } from "../../terms/terms.module";
import { ResourcesService } from "../../resource/service/resources.service";
import { ResourceModule } from "../../resource/resource.module";
import { CuratorService } from "../../curator/curator.service";

@Component({
  standalone: true,
  selector: "curator-reports-details",
  imports: [
    CommonModule,
    ReportFilterFormComponent,
    ReportCardComponent,
    ReportTableComponent,
    TermsModule,
    ResourceModule,
    ReportsModule,
    AngularSvgIconModule,
    PaginationComponent,
  ],
  templateUrl: "./curator-reports-details.component.html",
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuratorReportsDetailsComponent implements OnInit {
  onInit$ = new ReplaySubject<void>();
  reportFilter$: Observable<ReportFilter>;
  resource$: Observable<Resource>;
  curator$: Observable<User>;
  terms$: Observable<Term[]>;

  constructor(
    protected formBuilder: FormBuilder,
    protected reportsService: ReportsService,
    protected curatorService: CuratorService,
    protected termService: TermsService,
    protected resourceService: ResourcesService
  ) {
    this.resource$ = this.onInit$.pipe(
      switchMap(() =>
        !!this.resource
          ? of(this.resource)
          : this.resourceService.get_resource(this.resource_id)
      )
    );

    this.curator$ = this.onInit$.pipe(
      switchMap(() =>
        !!this.curator
          ? of(this.curator)
          : this.curatorService.get_curator(this.curator_orcid)
      )
    );

    this.terms$ = this.onInit$.pipe(
      switchMap(() =>
        !!this.terms
          ? of(this.terms)
          : this.resource$.pipe(
              switchMap(({ resource_id }: Resource) =>
                this.termService.getTerms({
                  resource_id: resource_id,
                  limit: -1,
                })
              )
            )
      )
    );
    this.reportFilter$ = combineLatest([
      this.resource$,
      this.curator$,
      this.reportFilterInput$,
      this.page$,
    ]).pipe(
      map(([resource, curator, reportFilter, page]) =>
        ReportFilter.create({
          resource_id: resource.resource_id,
          curator_orcid: curator.orcid_id,
          ...reportFilter.serialize(),
          limit: this.limit,
          skip: (page - 1) * this.limit,
        })
      )
    );
  }

  // handle terms prop reactivity
  loadTerms$: Observable<boolean>;
  reportsWithTerms$: Observable<{
    data: Report[];
    total: Number;
    skip: Number;
    limit: Number;
  }>;

  paginatedReports$: Observable<Paginated<Report>>;
  reportFilterInput$ = new BehaviorSubject<ReportFilter>(
    ReportFilter.create({
      from: null,
      to: new Date(),
      sortBy: "timestamp",
      sortOrder: -1,
      activity_terms: [],
    })
  );

  page$ = new BehaviorSubject<number>(1);

  get currentPage() {
    return this.page$.value;
  }

  update_page(page) {
    this.page$.next(page);
  }

  limit = 20;

  viewType: "table" | "grid" = "grid";

  ngOnInit(): void {
    this.onInit$.next();

    this.paginatedReports$ = this.reportFilter$.pipe(
      filter((filter) => !!filter),
      switchMap((reportFilter: ReportFilter) =>
        this.reportsService.getReportsCombineWithTerms(
          reportFilter,
          this.terms$
        )
      ),
      shareReplay()
    );
  }

  updateReportFilter(reportFilter: ReportFilter) {
    console.log("test from parent");
    this.reportFilterInput$.next(reportFilter);
  }

  @Input() curator_orcid?: string;
  @Input() curator: User;

  @Input() resource_id?: string;

  @Input() resource?: Resource;

  @Input() terms: Term[];
}
