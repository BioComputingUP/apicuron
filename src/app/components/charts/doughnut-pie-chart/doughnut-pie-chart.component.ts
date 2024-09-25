import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import Chart from "chart.js/auto";
import { BehaviorSubject, Subject } from "rxjs";
import { ActivitiesStatistics } from "../../../curator-statistics/models/curator-stats";
import { map, takeUntil, tap } from "rxjs/operators";

@Component({
  selector: "doughnut-pie-chart",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./doughnut-pie-chart.component.html",
})
export class DoughtnutPieChartComponent implements OnInit, OnDestroy {
  activities$ = new BehaviorSubject<ActivitiesStatistics[]>([]);

  @Input("activities") set activities(value: ActivitiesStatistics[]) {
    this.activities$.next(value);
  }
  @ViewChild("doughnutChart", { static: true }) doughnutChart: ElementRef;
  destroy$ = new Subject<Boolean>();

  chart: Chart<"doughnut", any, unknown> = null;

  chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const datasetIndex = tooltipItem.datasetIndex;
            const value = tooltipItem.raw;
            return datasetIndex === 0 ? `Count: ${value}` : `Score: ${value}`;
          },
        },
      },
    },
  };

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  ngOnInit(): void {
    this.setup();
  }

  groupActivitiesByCategory(activities: ActivitiesStatistics[]) {
    const groupedData = activities.reduce((acc, activity) => {
      const { activity_term, count } = activity;
      if (!acc[activity_term]) {
        acc[activity_term] = { totalCount: 0, totalScore: 0 };
      }
      acc[activity_term].totalCount += count;
      return acc;
    }, {});

    const categories = Object.keys(groupedData);
    const counts = categories.map((cat) => groupedData[cat].totalCount);

    return { categories, counts };
  }

  setup() {
    this.activities$
      .pipe(
        map((activities) => this.groupActivitiesByCategory(activities)),
        map((computed: any) => this.createChart(computed)),
        tap((chartData) => {
          if (this.chart) {
            this.chart.data = chartData;
            this.chart.update();
            return;
          }
          const ctx = this.doughnutChart.nativeElement.getContext("2d");
          this.chart = new Chart(ctx, {
            type: "doughnut",
            data: chartData,
            options: this.chartOptions,
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  createChart({ categories, counts }: any) {
    return {
      labels: categories,
      datasets: [
        {
          label: "Count",
          data: counts,
          hoverOffset: 4,
        },
      ],
    };
  }
}
