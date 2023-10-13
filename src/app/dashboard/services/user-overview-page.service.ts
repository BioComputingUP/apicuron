import { Injectable } from "@angular/core";
import { ResourcesService } from "../../resource/service/resources.service";
import {
  ReportsByResourceId,
  ReportsService,
} from "../../reports/services/reports.service";
import { AuthService } from "../../auth/auth.service";
import { BehaviorSubject, Observable, combineLatest, of } from "rxjs";
import { User } from "../../models/User.model";
import { ReportFilter } from "../../reports/interfaces/report-filter.interface";
import {
  delay,
  filter,
  map,
  mapTo,
  pairwise,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from "rxjs/operators";
import * as moment from "moment";
import { Paginated } from "../../interfaces/paginated";
import { Resource } from "../../models/resource.model";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { CuratorStatisticsService } from "../../curator-statistics/services/curator-statistics.service";
import { CuratorStatistics } from "../../models/statistics.model";
import * as _ from "lodash";

@Injectable()
export class UserOverviewPageService {
  reportFilter$: Observable<ReportFilter>;

  user$: Observable<User>;
  barChartReports$: Observable<ReportsByResourceId>;
  resources$: Observable<Resource[]>;
  reportsBarChartsForm: FormGroup<{
    from: FormControl<Date>;
    to: FormControl<Date>;
  }>;
  userStatistics$: Observable<CuratorStatistics[]>;
  selectedResource: FormControl<string>;
  currResourceStat$: Observable<CuratorStatistics>;

  constructor(
    protected reports: ReportsService,
    protected resourceService: ResourcesService,
    protected auth: AuthService,
    protected formBuilder: FormBuilder,
    protected stats: CuratorStatisticsService
  ) {
    this.user$ = this.auth.user$;

    this.setReportPlot();

    

    this.userStatistics$ = this.user$.pipe(
      switchMap((user: User) => {
        return this.stats.get_curator_statistics(user.orcid_id);
      }),
      tap((stats: CuratorStatistics[]) => {
        if(stats && stats.length > 0){
          this.selectedResource.setValue(stats[0].resource_id);
        }
      })
    );

    this.resources$ = this.userStatistics$.pipe(
        map((stats: CuratorStatistics[]) => {
            return stats.map((stat: CuratorStatistics) => stat.resource_id)
        }),
        switchMap((resourceIds: string[]) => this.resourceService.getResources(resourceIds))
    )
    
    // pie chart
    this.selectedResource = new FormControl("", {
      nonNullable: true,
    });

    this.currResourceStat$ = combineLatest([
      this.userStatistics$,
      this.selectedResource.valueChanges,
    ]).pipe(
      map(([stats, changes]: [CuratorStatistics[], string]) => {
        return stats.find(
          (stat) => stat.resource_id === this.selectedResource.value
        );
      })
    );
  }

  setReportPlot() {
    this.reportsBarChartsForm = this.formBuilder.group({
      from: [moment().subtract(1, "month").toDate(), [Validators.required]],
      to: [new Date(), [Validators.required]],
    });

    // an observable that emits when the form changes but starts with the initial value using startWith operator
    const barChartForm$ = this.reportsBarChartsForm.valueChanges.pipe(
      startWith(this.reportsBarChartsForm.value)
    );

    this.reportFilter$ = combineLatest([barChartForm$, this.auth.user$]).pipe(
      map(
        ([form, user]: [
          Partial<{
            from: Date;
            to: Date;
          }>,
          User
        ]) => {
          return ReportFilter.create({
            curator_orcid: user.orcid_id,
            to: form.to || this.reportsBarChartsForm.controls.to.value, // either the value changed so we take the new one or we keep the old value;
            from: form.from || this.reportsBarChartsForm.controls.from.value, // either the value changed so we take the new one or we keep the old value;
            limit: -1
          });
        }
      )
    );

    this.barChartReports$ = this.reportFilter$.pipe(
      switchMap((filter: ReportFilter) => {
        const reports$ = this.reports.getReports(filter);
        return this.reports.groupReportsByResourceId(reports$);
      }),
      shareReplay(1)
    );
  }
}
