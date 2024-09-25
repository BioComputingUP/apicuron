import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { Subject } from 'rxjs';

@Component({
  selector: "doughnut-pie-chart",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./doughnut-pie-chart.component.html",
})
export class DoughtnutPieChartComponent implements OnInit, OnDestroy {
  @Input('activities') activities;
  @ViewChild("doughnutChart", { static: true }) doughnutChart: ElementRef;
  destroy$ = new Subject<Boolean>();

  chart: any;

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  ngOnInit(): void {
    this.createChart();
  }

  groupActivitiesByCategory() {
    const groupedData = this.activities.reduce((acc, activity) => {
      const { activity_category, count, score } = activity;
      if (!acc[activity_category]) {
        acc[activity_category] = { totalCount: 0, totalScore: 0 };
      }
      acc[activity_category].totalCount += count;
      acc[activity_category].totalScore += score;
      return acc;
    }, {});

    const categories = Object.keys(groupedData);
    const counts = categories.map(cat => groupedData[cat].totalCount);
    const scores = categories.map(cat => groupedData[cat].totalScore);

    return { categories, counts, scores };
  }

  createChart() {
    const { categories, counts, scores } = this.groupActivitiesByCategory();

    const ctx = this.doughnutChart.nativeElement.getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Count',
            data: counts,
            backgroundColor: [ '#59C794', '#EDBF3A', '#F76135' ],
            hoverOffset: 4
          },
          {
            label: 'Score',
            data: scores,
            backgroundColor: [ '#59C794', '#EDBF3A', '#F76135' ],
            hoverOffset: 4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const datasetIndex = tooltipItem.datasetIndex;
                const value = tooltipItem.raw;
                return datasetIndex === 0 ? `Count: ${value}` : `Score: ${value}`;
              }
            }
          }
        }
      }
    });
  }
}