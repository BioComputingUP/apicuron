import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, startWith, take, tap } from "rxjs/operators";
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  concat,
} from "rxjs";
import { switchMap, pluck } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { User } from "src/app/models/User.model";
import { ResourceGroup } from "../../../models/resource-group.model";

// export type CreateLeague = Required<UpdateLeague>

// export type RemoveLeague = Omit<UpdateLeague>

// @Injectable({
// providedIn: 'root' // This is wrong, there are only some cases where this makes sense
// })
@Injectable()
export class GroupsService {
  resourceGroups$: Observable<ResourceGroup[]>;
  constructor(protected http: HttpClient, protected route: ActivatedRoute) {}

  ws = environment.ws;

  resource_id$: Observable<string>;
  leagues$: Observable<any[]>;
  currentParticipants$: Observable<any[]>;
  selectedGroup$ = new Subject<string>();
  currentGroup$: Observable<ResourceGroup>;
  curator$: Observable<User>;

  selectGroup$ = new Subject<ResourceGroup>();

  fetchResourceGroups(resource_id: string): Observable<ResourceGroup[]> {
    return this.http
      .get(`${environment.ws}/leagues/${resource_id}`, {
        headers: {
          Version: "2",
        },
      })
      .pipe(
        pluck("data"),
        map((data: any[]) =>
          data.map((data: any) => new ResourceGroup().deserialize(data))
        )
      );
  }

  init(resource_id$: Observable<string>) {
    this.resource_id$ = resource_id$;
    this.resourceGroups$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => this.fetchResourceGroups(resource_id))
    );

    const firstGroup$: Observable<ResourceGroup> = this.resourceGroups$.pipe(
      map((groups: ResourceGroup[]) => groups[0]),
      take(1)
    );

    this.currentGroup$ = concat(firstGroup$, this.selectGroup$);
  }

  getCurrentGroup(): Observable<ResourceGroup> {
    return this.currentGroup$;
  }

  getResourceGroups(): Observable<ResourceGroup[]> {
    return this.resourceGroups$;
  }

  getGroups(): Observable<any[]> {
    return this.leagues$;
  }

  selectGroup(group: ResourceGroup) {
    this.selectGroup$.next(group);
  }

  getParticipants() {
    return this.currentParticipants$;
  }

  onSelectedGroupChange(groupName) {
    this.selectedGroup$.next(groupName);
  }

  get_resource_leagues(resource_id: string) {
    return this.http.get(`${this.ws}/leagues/${resource_id}`, {
      headers: {
        version: "2",
      },
    });
  }

  create_league() {
    return this.http.post(this.ws + "/leagues", {
      headers: {
        version: "2",
      },
    });
  }

  delete_league() {
    return this.http.delete(this.ws + "/leagues", {
      headers: {
        version: "2",
      },
    });
  }

  add_league_member(curator) {
    return this.http.post(this.ws + "/leagues/add-member", curator, {
      headers: {
        Version: "2",
      },
    });
  }

  remove_league_member(curator) {
    // return this.http.delete(this.ws + "/leagues/remove-member", curator, {
    //   headers: {
    //     Version: '2'
    //   }
    // })
  }
}
