import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import {
  filter,
  map,
  shareReplay,
  switchMap,
  tap,
} from "rxjs/operators";
import { AuthService } from "../../auth/auth.service";
import * as moment from "moment";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { Resource } from "../../models/resource.model";
import { ResourcesService } from "../../resource/service/resources.service";
import {
  ReportsByResourceId,
  ReportsService,
} from "../../reports/services/reports.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
@Component({
  selector: "app-database-overview",
  templateUrl: "./database-overview.component.html",
  styleUrls: ["./database-overview.component.scss"],
})
export class DatabaseOverviewComponent implements OnInit {
  resource$: Observable<Resource>;
  user$: any;
  graphReportData$: Observable<ReportsByResourceId>;
  reportFilter$: Observable<ReportFilter>;
  reportGraphForm: FormGroup;

  maxTo = new Date();

  constructor(
    protected route: ActivatedRoute,
    protected databaseService: ResourcesService,
    protected authService: AuthService,
    protected formBuilder: FormBuilder,
    protected reportService: ReportsService
  ) {
    this.reportGraphForm = this.formBuilder.group({
      from: [moment().subtract(1, "month").toDate(), [Validators.required]],
      to: [new Date(), [Validators.required]],
    });

    this.resource$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const resource_id = params.get("resource_id");
        return this.databaseService.get_resource(resource_id);
      }),
      shareReplay(1),
    );

    this.reportFilter$ = this.resource$.pipe(
      map(({ resource_id }: Resource) => {
        return ReportFilter.create({
          resource_id,
          from: this.reportGraphForm.get("from").value,
          to: this.reportGraphForm.get("to").value,
          groupBy: "date",
        });
      }),
    );
    this.user$ = this.authService.user$;

    this.graphReportData$ = this.reportFilter$.pipe(
      switchMap((filter: ReportFilter) => {
        const reports$ = this.reportService.getReports(filter);
        return this.reportService.groupReportsByResourceId(reports$);
      }),
      shareReplay(1),
      tap(console.log)

    );
  }

  ngOnInit(): void {}
}
