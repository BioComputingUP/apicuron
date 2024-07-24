import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { WeeklyLeaderboardComponent } from '../weekly-leaderboard/weekly-leaderboard.component';
import Chart from 'chart.js/auto';

@Component({
  standalone: true,
  selector: 'weekly-bar-chart',
  templateUrl: './weekly-bar-chart.component.html',
  imports: [
    LeaderboardComponent,
    WeeklyLeaderboardComponent
  ],
})
export class WeeklyBarChartComponent implements AfterViewInit {
  @Input('days-of-week') daysOfWeek: Array<{ day: number; count: number }> = [];
  @ViewChild('chart', { static: true }) chartElement!: ElementRef;

  daysLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  chart: Chart<'line'> | undefined;

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart() {
    const canvas = this.chartElement.nativeElement as HTMLCanvasElement;
    canvas.width = 275;
    canvas.height = 60;

    const counts = this.daysOfWeek.map(item => item.count);

    new Chart(this.chartElement.nativeElement, {
      type: 'line',
      data: {
        labels: this.daysLabels,
        datasets: [{
          data: counts,
          fill: false,
          tension: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            }
          },
          y: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              display: false,
            }
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';

                if (context.parsed.y !== null) {
                  label = `${context.parsed.y}`;
                }

                return label; 
            }
          }
        }
      }
    }
    });
  }
}
