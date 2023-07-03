import { Injectable } from "@angular/core";
import { ResourcesService } from "../../resource/service/resources.service";
import { ReportsByResourceId, ReportsService } from "../../reports/services/reports.service";
import { AuthService } from "../../auth/auth.service";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { User } from "../../models/User.model";
import { ReportFilter } from "../../reports/interfaces/report-filter.interface";
import { map, shareReplay, startWith, switchMap, take, tap } from "rxjs/operators";
import * as moment from "moment";
import { Paginated } from "../../interfaces/paginated";
import { Resource } from "../../models/resource.model";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";



@Injectable()
export class UserOverviewPageService {

    reportFilter$: Observable<ReportFilter>;

    user$: Observable<User>;
    chartReports$: Observable<ReportsByResourceId>;
    resources$: Observable<Resource[]>;
    reportsChartForm: FormGroup<{ from: FormControl<Date>, to: FormControl<Date> }>;

    constructor(protected reports: ReportsService, protected resourceService: ResourcesService, protected auth: AuthService, protected formBuilder: FormBuilder) {
        this.user$ = this.auth.user$

        this.setReportPlot();

        this.resources$ = this.chartReports$.pipe(
            switchMap((reports: ReportsByResourceId) => {
                const resourceIds = Object.keys(reports);
                return this.resourceService.getResources(resourceIds);
            })
        )

    }

    setReportPlot() {

        this.reportsChartForm = this.formBuilder.group({
            from: [moment().subtract(1, 'month').toDate(), [Validators.required]],
            to: [new Date(), [Validators.required]]
        })

        this.reportFilter$ = combineLatest([this.reportsChartForm.valueChanges.pipe(startWith(this.reportsChartForm.value), shareReplay()), this.auth.user$]).pipe(
            map(([form, user]: [Partial<{
                from: Date;
                to: Date;
            }>, User]) => {
                return ReportFilter.create({
                    curator_orcid: user.orcid_id,
                    to: form.to || this.reportsChartForm.controls.to.value,  // either the value changed so we take the new one or we keep the old value;
                    from: form.from || this.reportsChartForm.controls.from.value  // either the value changed so we take the new one or we keep the old value;
                })
            })
        )


        this.chartReports$ = this.reportFilter$.pipe(
            switchMap((filter: ReportFilter) => {
                const reports$ =  this.reports.getReports(filter).pipe(shareReplay())
                return this.reports.groupReportsByResourceId(reports$);
            }),
            tap(console.log)
        )
    }


}