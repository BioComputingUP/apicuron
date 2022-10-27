import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { DatabasesService } from '../../databases/services/databases.service';

@Component({
  selector: 'app-manage-achievements',
  templateUrl: './manage-achievements.component.html',
  styleUrls: ['./manage-achievements.component.scss']
})
export class ManageAchievementsComponent implements OnInit {
  resourceId$: Observable<string>;
  resource$: Observable<unknown>;

  constructor(protected route: ActivatedRoute, protected databaseService: DatabasesService) {
    this.resourceId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get('resource_id')
      })
    )

    // retrieve the resource from the API
    this.resource$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource_details(resource_id);
      }),
      shareReplay(),
      pluck("data")
    );
   }

  ngOnInit(): void {
  }

}
