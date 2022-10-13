import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/operators';
import { DatabasesService } from '../services/databases.service';

@Component({
  selector: 'app-database-dashboard',
  templateUrl: './database-dashboard.component.html',
  styleUrls: ['./database-dashboard.component.scss']
})
export class DatabaseDashboardComponent implements OnInit {
  resource_id$: Observable<string>;
  resource$: Observable<Object>;
  resource_data$: Observable<Object>;

  constructor(protected route: ActivatedRoute, protected databaseService: DatabasesService) {
    this.resource_id$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get('resource_id')
      })
    )

    this.resource_data$ = this.resource_id$.pipe(
      switchMap((resource_id : string) => {
        return this.databaseService.get_resource_details(resource_id)
      })
    )
    this.resource$ = this.resource_data$.pipe(pluck('data'))
  }

  ngOnInit(): void {
  }

}
