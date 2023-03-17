import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { first, map, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { DatabasesService } from '../../databases/services/databases.service';
import { AuthService } from '../../auth/auth.service';
import { DashboardService } from '../services/dashboard.service';
import { Observable } from 'rxjs';
import { ReportStatistics } from '../../models/Report.model';
import * as moment from 'moment'
@Component({
  selector: 'app-database-overview',
  templateUrl: './database-overview.component.html',
  styleUrls: ['./database-overview.component.scss']
})
export class DatabaseOverviewComponent implements OnInit {
  resource$: any;
  user$: any;
  reportStatistics$: Observable<ReportStatistics[]>

  firstDay = moment().startOf('month').toDate()

  lastDay = moment().endOf('month').toDate()

  constructor(protected route:ActivatedRoute,
    protected databaseService: DatabasesService,
    protected authService: AuthService,
    protected dashboardService: DashboardService) {
    this.resource$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const resource_id = params.get('resource_id')
        return this.databaseService.get_resource(resource_id)
      }),
      shareReplay(),
      pluck('data')
    )
    this.user$ = this.authService.user$;
    

    this.reportStatistics$ = this.resource$.pipe(
      switchMap(({ resource_id }: { resource_id: string }) => {
        moment()
        return this.dashboardService.get_report_statistics({ 
          resource_id,
          from: this.firstDay,
          to: this.lastDay > new Date() ? new Date() : this.lastDay,
          groupBy: 'date'
        })
      }),
      shareReplay()
    )

    
  }

  ngOnInit(): void {

    // this.plotData$.subscribe((plotData) => {
    //   console.log('plotData', plotData)
    //   Plotly.newPlot('#main_chart', [plotData])
    // })
  }

}
