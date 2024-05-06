import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { switchMap, pluck } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  
  constructor(
    protected http: HttpClient,
    protected route: ActivatedRoute,
    ) {}
  
  resource_id$: Observable<string>;
  leagues$: Observable<any[]>;
  currentParticipants$: Observable<any[]>;
  selectedGroup$ = new Subject<string>();
  currentGroup$: Observable<string>;

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

    this.currentParticipants$ = combineLatest([
      this.selectedGroup$,
      this.leagues$
    ]).pipe(
      map(([groupName, groups]: [string, any[]]) => {
        const selectedGroup = groups.find((group) => group.name == groupName)
        return selectedGroup.defaultMembers; // defaultMembers is the array with the list of participants
      })
    )
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
}