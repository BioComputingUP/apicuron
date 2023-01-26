import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DatabasesService } from '../../databases/services/databases.service';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-database-dashboard',
  templateUrl: './database-dashboard.component.html',
  styleUrls: ['./database-dashboard.component.scss']
})
export class DatabaseDashboardComponent implements OnInit {
  resourceId$: any;
  resource$: any;

  constructor(protected route: ActivatedRoute,
    protected databaseService: DatabasesService) {
   // retreive the resourceId from the paramMap

   this.resourceId$ = this.route.paramMap.pipe(
     map((params: ParamMap) => {
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
