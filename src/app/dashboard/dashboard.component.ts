import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { DatabasesService } from '../databases/services/databases.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  resourceId$: any;
  resource$: any;

  constructor(protected route: ActivatedRoute,
     protected databaseService: DatabasesService) {
    // retreive the resourceId from the paramMap
    console.log({
      component: this.route.component,
      url: this.route.url
    })
    this.resourceId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        console.log(params)
        return params.get("resource_id");
      })
    );

    this.resource$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource(resource_id);
      }),
      shareReplay(),
      pluck('data')
    );

  }

  ngOnInit(): void {
  }

}
