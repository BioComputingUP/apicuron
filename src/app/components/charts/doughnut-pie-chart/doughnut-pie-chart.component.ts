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
      const { activity_category, count, score } = activity;
      if (!acc[activity_category]) {
        acc[activity_category] = { totalCount: 0, totalScore: 0 };
      }
      acc[activity_category].totalCount += count;
      acc[activity_category].totalScore += score;
      return acc;
    }, {});

    const categories = Object.keys(groupedData);
    const counts = categories.map((cat) => groupedData[cat].totalCount);
    const scores = categories.map((cat) => groupedData[cat].totalScore);

    return { categories, counts, scores };
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

  createChart({ categories, counts, scores }: any) {
    return {
      labels: categories,
      datasets: [
        {
          label: "Count",
          data: counts,
          backgroundColor: ["#59C794", "#EDBF3A", "#F76135"],
          hoverOffset: 4,
        },
        {
          label: "Score",
          data: scores,
          backgroundColor: ["#59C794", "#EDBF3A", "#F76135"],
          hoverOffset: 4,
        },
      ],
    };
  }
}
