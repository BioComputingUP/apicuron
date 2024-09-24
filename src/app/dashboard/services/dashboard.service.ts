import { filter, map, shareReplay, switchMap, tap } from "rxjs/operators";
import { AuthService } from "../../auth/auth.service";
import { CuratorStatisticsService } from "../../curator-statistics/services/curator-statistics.service";
import { ResourcesService } from "../../resource/service/resources.service";
import { UsersService } from "./users.service";
import { User } from "../../models/User.model";
import { combineLatest, Observable, pipe, ReplaySubject, Subject } from "rxjs";
import { CuratorStatistics } from "../../models/statistics.model";
import { Resource } from "../../models/resource.model";
import { Injectable } from "@angular/core";

@Injectable()
export class DashboardService {
  currentResource$: Observable<any>;
  currentResourceStats$: Observable<any>;
  constructor(
    protected userService: UsersService,
    protected resourceService: ResourcesService,
    protected statService: CuratorStatisticsService,
    protected auth: AuthService
  ) {
    this.init();
  }

  user$: Observable<User>;
  contributedResources$: Observable<Resource[]>;
  managedResources$: Observable<Resource[]>;
  userStats$: Observable<CuratorStatistics[]>;

  init() {
    this.user$ = this.getCurrentUser();
    this.userStats$ = this.getCuratorStatistics();
    const managedResourceIds$ = this.getManagedResourceIds();
    const contributedResourceIds$ = this.getContributedResourceIds(
      this.userStats$
    );
    const resources$ = combineLatest([
      managedResourceIds$,
      contributedResourceIds$,
    ]).pipe(
      map(([managedResourceIds, contributedResourceIds]) => {
        const resourceIds = new Set([
          ...managedResourceIds,
          ...contributedResourceIds,
        ]);
        return Array.from(resourceIds);
      }),
      switchMap((resourceIds: string[]) => {
        return this.resourceService
          .getResources(resourceIds)
          .pipe(shareReplay(1));
      }),
      shareReplay(1)
    );
    this.contributedResources$ = combineLatest([
      resources$,
      contributedResourceIds$,
    ]).pipe(this.filterResources);
    this.managedResources$ = combineLatest([
      resources$,
      managedResourceIds$,
    ]).pipe(this.filterResources);
  }

  private filterResources = pipe(
    map(([resources, resourceIds]: [Resource[], string[]]) => {
      return resources.filter((resource) =>
        resourceIds.includes(resource.resource_id)
      );
    }),
    filter((resources: Resource[]) => resources.length > 0)
  );

  getCurrentUser() {
    return this.auth.user$;
  }

  getManagedResourceIds(): Observable<string[]> {
    return this.auth.user$.pipe(
      map((user: User) =>
        user.resources.map((resource) => resource.resource_id)
      )
    );
  }

  getCuratorStatistics(): Observable<CuratorStatistics[]> {
    return this.auth.user$.pipe(
      switchMap((user: User) =>
        this.statService.get_curator_statistics(user.orcid_id)
      ),
      shareReplay(1)
    );
  }

  getContributedResourceIds(
    stats$: Observable<CuratorStatistics[]>
  ): Observable<string[]> {
    return stats$.pipe(map((stats) => stats.map((stat) => stat.resource_id)));
  }

  getUserResourceStatistics(
    resource_id: string
  ): Observable<CuratorStatistics[]> {
    return this.userStats$.pipe(
      map((stats: CuratorStatistics[]) =>
        stats.filter((stat) => stat.resource_id === resource_id)
      )
    );
  }

  getDetailedStatistics(resourceId: string) {
    return this.user$.pipe(
      switchMap((user: User) =>
        this.statService
          .getDetailedStatistics(resourceId, user.orcid_id)
          .pipe(shareReplay(1))
      ),
      shareReplay(1)
    );
  }
}
