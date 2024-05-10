import { Component, Input, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  standalone: true,
  selector: 'barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.scss']
})
export class BarchartComponent implements OnInit {
  public chart: any;

  ngOnInit(): void {
    this.createChart();
  }

  @Input()
  // add input - array of 7 numbers

  createChart() {
    const contributionsData = [216, 176, 184, 196, 192, 182, 182];

    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('barchart');

    new Chart(
      canvas,
      {
        type: 'bar',
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Weekly Contributions',
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Weekdays'
              },
              beginAtZero: true,
              grid: {
                display: false,
              },
            },
            y: {
              title: {
                display: true,
                text: 'Contributions'
              },
            },
          },
        },
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Number of Contributions',
              backgroundColor: "#4D194D",
              data: contributionsData // @Input
            }
          ]
        }
      });
    }
  }