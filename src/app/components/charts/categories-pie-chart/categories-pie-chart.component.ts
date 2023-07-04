import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { CuratorStatistics } from '../../../models/statistics.model';
import Plotly from 'plotly.js-dist-min';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import tailwindConfig from '../../../../../tailwind.config.js';
@Component({
  selector: 'categories-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories-pie-chart.component.html',
  styleUrls: ['./categories-pie-chart.component.scss']
})
export class CategoriesPieChartComponent implements AfterViewInit {

  plotData$: Observable<Plotly.Data[]>;
  @ViewChild('pieChart') pieChart: ElementRef;
  plot$: any;


  @Input()
  get statistics() {
    return this.statistics$.value
  }
  set statistics(value: CuratorStatistics) {
    this.statistics$.next(value)
  }


  statistics$ = new BehaviorSubject<CuratorStatistics>(null);
  constructor() {

    
    const colors: string[] = ['generation', 'invalidation', 'revision'].map((name) => tailwindConfig.theme.extend.colors[name])

    this.plotData$ = this.statistics$.pipe(
      map((stats: CuratorStatistics) => {
        const categories: string[] = ['Generation', 'Invalidation', 'Revision'];
        const values: number[] = [stats.generation_count, stats.invalidation_count, stats.revision_count];
        return [{
          values,
          labels: categories,
          type: 'pie',
          hole: 0.6,
          marker: {
            colors,
          },
          hoverinfo: 'label+percent',
          texttemplate: '%{value} %{label} Events, (%{percent})',
          textinfo: 'value',
          textposition: 'outside',
          automargin: true,
        }]
      })
    )
  }


  ngAfterViewInit(): void {
    this.plot$ = this.plotData$.subscribe((data: Plotly.Data[]) => {
      Plotly.newPlot(this.pieChart.nativeElement, data, { title: 'Contributions By Category' }, { responsive: true })
    });
  }

}

