import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { DatabasesService } from '../../databases/services/databases.service';
import { TermsService } from '../services/terms.service';
import { AchievmentsDefService } from './achievements.service';

@Component({
  selector: 'app-manage-achievements',
  templateUrl: './manage-achievements.component.html',
  styleUrls: ['./manage-achievements.component.scss']
})
export class ManageAchievementsComponent implements OnInit {
  resourceId$: Observable<string>;
  resource$: Observable<unknown>;
  badges$: Observable<Object>;
  medals$: Observable<Object>;
  terms$: Observable<any>;

  constructor(protected route: ActivatedRoute,
    protected databaseService: DatabasesService,
    protected achievmentsDefService: AchievmentsDefService,
    protected termsService: TermsService) {
    this.resourceId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get('resource_id')
      })
    )

    // retrieve the resource from the API
    this.resource$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource(resource_id);
      }),
      shareReplay(),
      pluck("data")
    );

    this.terms$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.termsService.get_resource_terms(resource_id);
      }),
      shareReplay(),
      pluck('data')
    )

    this.medals$ = this.resourceId$.pipe(
      switchMap((resource_id: string) => {
        return this.achievmentsDefService.get_resource_medals(resource_id)
      })
    )
  }

  ngOnInit(): void {
  }

}
