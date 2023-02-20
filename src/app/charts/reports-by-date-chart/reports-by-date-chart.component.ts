import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReportStatistics } from "../../models/Report.model";
import { Data } from "plotly.js-dist-min";
import * as Plotly from 'plotly.js-dist-min'
import * as Moment from "moment";
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment)

@Component({
  selector: "reports-by-date-chart",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./reports-by-date-chart.component.html",
  styleUrls: ["./reports-by-date-chart.component.scss"],
})
export class ReportsByDateChartComponent implements OnInit {
  constructor() {}

  @ViewChild("Graph", { static: true })
  private Graph: ElementRef;

  @Input() reportStats: ReportStatistics[];

  traceData: Data = {
    x: new Array(),
    y: new Array(),
    type: 'bar',
    name: 'Number of Contributions',
    text: new Array<string>(),
    showlegend: false,
    marker: {
      color: '#4D194D'
    },
    hovertemplate: 'Date: %{x}<br>Contributions: %{y}<extra></extra>',
  };

  @Input('layout') layoutInput: Partial<Plotly.Layout> = {}

  private defaultLayout: Partial<Plotly.Layout> = {};

  // default value for the displayed date range is the first day of the month and Today
  @Input('first-day') firstDay: Date = moment().subtract(30, 'days').toDate() // get the date, 30 days ago

  @Input('last-day') lastDay: Date = new Date()

  ngOnInit(): void {
    
    this.build_plot_data()
    // initalizing the default layout
    this.build_default_layout();
    Plotly.newPlot(this.Graph.nativeElement, [this.traceData], this.main_layout())
  }

  private build_default_layout(){
    this.defaultLayout = {
      // title: {
      //   text: `Number of contributions from ${moment(this.firstDay).format('DD/MM')} to ${moment(this.lastDay).format('DD/MM')}`,
      //   font: {
      //     color: '#333',
      //     family: "'DM Sans', sans-serif",
      //     // size: 1.5
      //   },
      // },
      xaxis: {
        title: 'Days'
      },
      yaxis: {
        title: 'Contributions',
        tickmode: 'linear',
        dtick: 1
      }
    }
  }

  private main_layout(){
    return {
      ...this.defaultLayout,
      ...this.layoutInput
    }
  }

  private build_plot_data(){

    // Create a range of dates from the first to the last day
    const dateRange = moment.range(this.firstDay, this.lastDay);
    // make an iterable of the range by DAY and format the dates to DD/MM
    const allDatesInclusive = Array.from(dateRange.by('day')).map(d => moment(d).format('DD/MM'))

    // create a dateMap that maps each date string to a number
    const dateMap = new Map<string, number>();

    // populate the dateMap from the data
    this.reportStats.forEach(stat => dateMap.set(moment(stat.timestamp).format('DD/MM'), stat.count))
    
    this.traceData['x'] = allDatesInclusive

    // if the data is present in the datemap return the value, otherwise return 0
    this.traceData['y'] = allDatesInclusive.map(d => dateMap.get(d) || 0)
  }
}
