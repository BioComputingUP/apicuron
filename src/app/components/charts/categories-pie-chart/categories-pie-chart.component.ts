import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { CuratorStatistics } from "../../../models/statistics.model";
import Plotly from "plotly.js-dist-min";
import { map, takeUntil } from "rxjs/operators";
import * as _ from "lodash";
import tailwindConfig from "../../../../../tailwind.config.js";

@Component({
  selector: "categories-pie-chart",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./categories-pie-chart.component.html",
  styleUrls: ["./categories-pie-chart.component.scss"],
})
export class CategoriesPieChartComponent implements AfterViewInit, OnDestroy {
  plotData$: Observable<Plotly.Data[]>;
  @ViewChild("pieChart") pieChart: ElementRef;
  destroy$ = new Subject<Boolean>();

  @Input()
  get statistics() {
    return this.statistics$.value;
  }
  set statistics(value: CuratorStatistics) {
    this.statistics$.next(value);
  }

  statistics$ = new BehaviorSubject<CuratorStatistics>(null);

  constructor() {
    const colors: string[] = ["generation", "invalidation", "revision"].map(
      (name) => tailwindConfig.theme.extend.colors[name]
    );

    this.plotData$ = this.statistics$.pipe(
      map((stats: CuratorStatistics) => {
        const categories: string[] = ["Generation", "Invalidation", "Revision"];
        const values: number[] = [
          stats.generation_count,
          stats.invalidation_count,
          stats.revision_count,
        ];
        return [
          {
            values,
            labels: categories,
            type: "pie",
            hole: 0.6,
            marker: {
              colors,
            },
            hoverinfo: "label+percent",
            texttemplate: "%{value} %{label} (%{percent})",
            textinfo: "none",
            textposition: "outside",
            automargin: true,
          },
        ];
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  ngAfterViewInit(): void {
    this.plotData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Plotly.Data[]) => {
        Plotly.newPlot(
          this.pieChart.nativeElement,
          data,
          {
            height: 350,
            width: 350,
            margin: { t: 10, b: 50, l: 0, r: 0 },
            showlegend: true,
            legend: {
              orientation: "h", // Make legend horizontal
              x: 0.5, // Center legend horizontally
              y: -0.2, // Move legend below the chart
              xanchor: "center",
              yanchor: "top",
            },
          },
          { responsive: true }
        );
      });
  }
}
