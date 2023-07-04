import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Data } from "plotly.js-dist-min";
import * as Plotly from "plotly.js-dist-min";
import * as Moment from "moment";
import { extendMoment } from "moment-range";
import {
  ReportFilter,
  ReportFilterField,
} from "src/app/reports/interfaces/report-filter.interface";
import { BehaviorSubject, Observable, Subscription, combineLatest } from "rxjs";
import { filter, map, switchMap, take, tap } from "rxjs/operators";
import { ReportsModule } from "src/app/reports/reports.module";
import {
  ReportsByResourceId,
  ReportsService,
} from "src/app/reports/services/reports.service";
import { Paginated } from "src/app/interfaces/paginated";
import { ReportGroupBy } from "src/app/reports/types/group-by";
import { GroupedReports } from "src/app/reports/interfaces/grouped-reports.interface";
import { ReportFilterFormComponent } from "../../report-filter-form/report-filter-form.component";
import { Report } from "../../../models/report.model";
import { ResourceModule } from "../../../resource/resource.module";
import { ResourcesService } from "../../../resource/service/resources.service";
import { Resource } from "../../../models/resource.model";

const moment = extendMoment(Moment);

@Component({
  selector: "reports-by-date-chart",
  standalone: true,
  imports: [
    CommonModule,
    ReportsModule,
    ReportFilterFormComponent,
    ResourceModule,
  ],
  templateUrl: "./reports-by-date-chart.component.html",
  styleUrls: ["./reports-by-date-chart.component.scss"],
})
export class ReportsByDateChartComponent implements OnDestroy, AfterViewInit {
  plot$: Subscription;

  constructor(
    protected reports: ReportsService,
    protected resourceService: ResourcesService
  ) {}

  ngAfterViewInit(): void {
    this.plot$ = combineLatest([this.plotData$, this.plotLayout$]).subscribe(
      ([plotData, plotLayout]: [Data[], Plotly.Layout]) => {
        return Plotly.newPlot(this.Graph.nativeElement, plotData, plotLayout, {
          responsive: true,
        });
      }
    );
  }
  ngOnDestroy(): void {
    this.plot$.unsubscribe();
  }

  @ViewChild("Graph")
  Graph: ElementRef;

  @Input()
  public get reportFilter(): ReportFilter {
    return this.reportFilter$.value;
  }
  public set reportFilter(value: ReportFilter) {
    this.reportFilter$.next(value);
  }

  readonly reportFilter$ = new BehaviorSubject(null);

  readonly reportsData$: BehaviorSubject<ReportsByResourceId> =
    new BehaviorSubject({});

  @Input()
  public get reportsData(): ReportsByResourceId {
    return this.reportsData$.value;
  }
  public set reportsData(value: ReportsByResourceId) {
    this.reportsData$.next(value);
  }

  readonly resources$: BehaviorSubject<Resource[]> = new BehaviorSubject([]);
  @Input()
  public get resources(): Resource[] {
    return this.resources$.value;
  }
  public set resources(value: Resource[]) {
    this.resources$.next(value);
  }

  private readonly _plotData$: Observable<Data[]> = combineLatest([
    this.reportFilter$,
    this.reportsData$,
    this.resources$,
  ]).pipe(
    map(
      ([reportFilter, reportsData, resources]: [
        ReportFilter,
        ReportsByResourceId,
        Resource[]
      ]) => {
        // for Each resource
        return resources.map((resource) => {
          const reports: Report[] = reportsData[resource.resource_id];

          // Create a range of dates from the first to the last day
          const dateRange = moment.range(reportFilter.from, reportFilter.to);
          // make an iterable of the range by DAY and format the dates to DD/MM
          const allDatesInclusive: string[] = Array.from(
            dateRange.by("day")
          ).map((d) => moment(d).format("DD/MM/YY"));

          // create a dateMap that maps each date string to a number
          const dateMap = new Map<string, number>();

          // populate the dateMap from the data
          reports.forEach((report) => {
            const dateFormat = moment(report.timestamp).format("DD/MM/YY");
            dateMap.set(dateFormat, (dateMap.get(dateFormat) || 0) + 1);
          });

          const traceData: Data = {
            x: new Array(),
            y: new Array(),
            type: "bar",
            name: "Number of Contributions",
            text: new Array<string>(),
            showlegend: false,
            marker: {
              color: resource.color || "#4D194D",
            },
            hovertemplate: `%{y} Contributions to ${resource.resource_name}<extra></extra>`,
          };
          traceData["x"] = allDatesInclusive;

          // if the data is present in the datemap return the value, otherwise return 0
          traceData["y"] = allDatesInclusive.map((d) => dateMap.get(d) || 0);

          return traceData;
        });
      }
    )
  );
  public get plotData$(): Observable<Data[]> {
    return this._plotData$;
  }

  readonly plotLayout$ = new BehaviorSubject<Partial<Plotly.Layout>>({
    // title: {
    //   text: `Number of contributions from ${moment(this.firstDay).format('DD/MM')} to ${moment(this.lastDay).format('DD/MM')}`,
    //   font: {
    //     color: '#333',
    //     family: "'DM Sans', sans-serif",
    //     // size: 1.5
    //   },
    // },
    autosize: true,
    barmode: "stack",
    xaxis: {
      title: "Days",
    },
    yaxis: {
      title: "Contributions",
      tickmode: "linear",
      dtick: 1,
      range: [0, null],
    },
    margin: {
      t: 10,
    },
  });
}
