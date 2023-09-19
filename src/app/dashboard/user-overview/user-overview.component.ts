import {
  Component,
} from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { User } from "src/app/models/User.model";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { UserOverviewPageService } from "../services/user-overview-page.service";
import { ReportsByResourceId } from "../../reports/services/reports.service";
import { Resource } from "../../models/resource.model";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
} from "@angular/forms";
import { CuratorStatistics } from "../../models/statistics.model";
@Component({
  selector: "user-overview",
  templateUrl: "./user-overview.component.html",
  styleUrls: ["./user-overview.component.scss"],
})


export class UserOverviewComponent {
  user$: Observable<User>;
  chartReports$: Observable<ReportsByResourceId>;
  resources$: Observable<Resource[]>;
  chartData$: Observable<[Resource[], ReportsByResourceId, ReportFilter]>;
  readonly reportFilter$: Observable<ReportFilter>;
  reportsChartForm: FormGroup<{
    from: FormControl<Date>;
    to: FormControl<Date>;
  }>;
  maxTo = new Date();
  statistics$: Observable<CuratorStatistics[]>;
  selectedResource: FormControl<string>;
  currResourceStat$: Observable<CuratorStatistics>;

  constructor(
    protected auth: AuthService,
    protected page: UserOverviewPageService,
    protected formBuilder: FormBuilder
  ) {
    // login data
    this.user$ = this.auth.user$;

    // reports Bar chart data
    this.reportFilter$ = this.page.reportFilter$;
    this.chartReports$ = this.page.barChartReports$;
    this.reportsChartForm = this.page.reportsBarChartsForm;

    // general data
    this.resources$ = this.page.resources$;
    this.chartData$ = combineLatest([
      this.resources$,
      this.chartReports$,
      this.reportFilter$,
    ]);
    this.statistics$ = this.page.userStatistics$;

    // pie chart
    this.selectedResource = this.page.selectedResource;
    this.currResourceStat$ = this.page.currResourceStat$;
  }

}
