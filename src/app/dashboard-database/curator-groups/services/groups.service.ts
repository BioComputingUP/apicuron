import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { switchMap, pluck } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/models/User.model';

export type UpdateLeague = {
  // orcid_id: string;
  // curator_name: string;
  // curator_group: string;
}

// export type CreateLeague = Required<UpdateLeague>

// export type RemoveLeague = Omit<UpdateLeague>

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  
  constructor(
    protected http: HttpClient,
    protected route: ActivatedRoute,
    ) {}
  
  ws = environment.ws

  resource_id$: Observable<string>;
  leagues$: Observable<any[]>;
  currentParticipants$: Observable<any[]>;
  selectedGroup$ = new Subject<string>();
  currentGroup$: Observable<string>;
  curator$: Observable<User>;

  init(resource_id$: Observable<string>) {
    this.resource_id$ = resource_id$;
    this.leagues$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => {
        return this.http.get(`${environment.ws}/leagues/${resource_id}`, {
          headers: {
            Version: '2'
          }
        })
      }),
      pluck('data'),
    )

    this.currentParticipants$ = this.leagues$.pipe(
      map((groups) => {
        return groups.reduce((allParticipants, group) => {
          return allParticipants.concat(group.defaultMembers
            .map(participant => [participant, group.name]));
        }, []);
      })
    );
  }

  getGroups(): Observable<any[]> {
    return this.leagues$;
  }

  selectGroup(name: string) {
    this.selectedGroup$.next(name);
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
        version: '2',
      },
    })
  }

  create_league() {
    return this.http.post(this.ws + "/leagues", {
      headers: {
        version: '2',
      },
    })
  }

  delete_league() {
    return this.http.delete(this.ws + "/leagues", {
      headers: {
        version: '2',
      },
    })
  }

  add_league_member(curator: UpdateLeague) {
    return this.http.post(this.ws + "/leagues/add-member", curator, {
      headers: {
        Version: '2'
      }
    })
  }

  remove_league_member(curator: UpdateLeague) {
    // return this.http.delete(this.ws + "/leagues/remove-member", curator, {
    //   headers: {
    //     Version: '2'
    //   }
    // })
  }
}