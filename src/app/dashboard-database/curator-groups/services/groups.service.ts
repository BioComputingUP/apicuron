import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  catchError,
  map,
  shareReplay,
  startWith,
  take,
  takeUntil,
  tap,
} from "rxjs/operators";
import {
  Observable,
  Subject,
  combineLatest,
  merge,
  of,
  throwError,
} from "rxjs";
import { switchMap, pluck } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { ResourceGroup } from "../../../models/resource-group.model";
import { Dialog } from "@angular/cdk/dialog";
import { ViewParticipantsComponent } from "../view-participants/view-participants.component";
import { UpdateGroupComponent } from "../update-group/update-group.component";
import { GroupCreateForm } from "../../../components/group-create-form/group-create-form.component";
import { ToastrService } from "ngx-toastr";
import { ConfirmationService } from "../../../../../projects/apicuron-util/src/lib/confirmation";

export type UpdateGroup = Partial<ResourceGroup> & DeleteGroup;
export type DeleteGroup = Pick<ResourceGroup, "name" | "resource_id">;

type GroupOperation = {
  group: ResourceGroup;
  operation: "update" | "delete" | "create";
} | null;

@Injectable()
export class GroupsService implements OnDestroy {
  constructor(
    protected http: HttpClient,
    protected route: ActivatedRoute,
    protected dialog: Dialog,
    protected confirmationService: ConfirmationService,
    protected toastr: ToastrService
  ) {}

  resourceGroups$: Observable<{ data: ResourceGroup[] }>;
  destroy$ = new Subject<void>();
  ws = environment.ws;
  resource_id$: Observable<string>;
  groupUpdates$ = new Subject<GroupOperation>();

  ngOnDestroy(): void {
    this.destroy$.next();
  }

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
    const resourceGroupList$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => this.fetchResourceGroups(resource_id)),
      map((groups: ResourceGroup[]) => ({ data: groups }))
    );

    this.resourceGroups$ = combineLatest([
      resourceGroupList$,
      this.groupUpdates$.pipe(startWith(<string>null)),
    ]).pipe(
      map(
        ([resourceGroupList, groupUpdates]: [
          { data: ResourceGroup[] },
          GroupOperation
        ]) => {
          return this.loadGroupsList(resourceGroupList, groupUpdates);
        }
      )
    );
  }

  loadGroupsList(
    resourceGroupList: { data: ResourceGroup[] },
    groupUpdates: GroupOperation
  ): { data: ResourceGroup[] } {
    if (!!groupUpdates) {
      switch (groupUpdates.operation) {
        case "create":
          resourceGroupList.data = [
            ...resourceGroupList.data,
            groupUpdates.group,
          ];
          break;
        case "delete":
          resourceGroupList.data = resourceGroupList.data.filter(
            (group) => group.name != groupUpdates.group.name
          );
          break;
        case "update":
          resourceGroupList.data = resourceGroupList.data.map((group) =>
            // if the group matches the updated group we replace the value with the new one.
            // otherwise we keep the old group
            group.name == groupUpdates.group.name ? groupUpdates.group : group
          );
          break;
      }
    }
    return resourceGroupList;
  }

  getResourceGroups(): Observable<{ data: ResourceGroup[] }> {
    return this.resourceGroups$;
  }

  openCreateGroupForm() {
    const dialogRef = this.dialog.open(GroupCreateForm);
    const component: GroupCreateForm = dialogRef.componentInstance;

    combineLatest([component.formResult, this.resource_id$])
      .pipe(
        switchMap(([resourceGroup, resource_id]: [ResourceGroup, string]) => {
          resourceGroup.resource_id = resource_id;
          return this.createNewGroup(resourceGroup);
        }),
        map((group: ResourceGroup) => {
          dialogRef.close();
          this.groupUpdates$.next({ group, operation: "create" });
          return group;
        }),
        takeUntil(merge(this.destroy$, component.destroy$))
      )
      .subscribe(() => {});
  }

  openUpdateGroupForm(resourceGroup: ResourceGroup) {
    // Pass the resourceGroup as an input (use the CreateGroupForm as an example)
    const dialogRef = this.dialog.open(UpdateGroupComponent, {
      data: {
        group: resourceGroup,
      },
      maxWidth: "95vw",
    });
    const component: UpdateGroupComponent = dialogRef.componentInstance;

    component.formResult
      .pipe(
        tap(console.log),
        switchMap((group: ResourceGroup) => {
          return this.updateGroup(group);
        }),
        map(({ data, error }: { data: ResourceGroup; error: string }) => {
          if (!!error) {
            this.toastr.error(error, `Error occured when updating Group`);
            return;
          }
          this.toastr.success(
            `Group Updated Successfully`,
            `Successfully Updated the ${data.name}`
          );
          dialogRef.close();
          this.groupUpdates$.next({ group: data, operation: "update" });
          return data;
        }),
        takeUntil(merge(this.destroy$, component.destroy$))
      )
      .subscribe(() => {});
  }

  viewParticipants(resourceGroup: ResourceGroup) {
    this.dialog.open(ViewParticipantsComponent, {
      data: {
        group: resourceGroup,
      },
    });
  }

  createNewGroup(group: ResourceGroup) {
    return this.http
      .post(`${this.ws}/leagues`, group.serialize(), {
        headers: { version: "2" },
      })
      .pipe(
        pluck("data"),
        map((response: any) => {
          return new ResourceGroup().deserialize(response);
        })
      );
  }

  addMemberToLeague(group: ResourceGroup) {
    this.resource_id$.pipe(
      take(1),
      switchMap((resource_id) => {
        return this.http.post(`${this.ws}/leagues/add-member`, {
          headers: { version: "2" },
          body: {
            // member:
            resource_id: resource_id,
            league: group.name,
          },
        });
      })
    );
  }

  deleteMemberFromLeague(group: ResourceGroup) {
    this.resource_id$.pipe(
      take(1),
      switchMap((resource_id) => {
        return this.http.delete(`${this.ws}/leagues/remove-member`, {
          headers: { version: "2" },
          body: {
            // member:
            resource_id: resource_id,
            league: group.name,
          },
        });
      })
    );
  }

  deleteGroup(group: ResourceGroup) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the group ${group.displayedName}?`,
      title: `Delete Group`,
      iconSrc: "assets/svg/exclamation-circle.svg",
      accept: async () => {
        return await this.deleteGroupConfirmed(group);
      },
      reject: async () => {},
    });
  }

  deleteGroupConfirmed(group: ResourceGroup): Promise<any> {
    const deletion$ = this.resource_id$.pipe(
      take(1),
      switchMap((resource_id) => {
        return this.http
          .delete(`${this.ws}/leagues`, {
            headers: { version: "2" },
            body: {
              resource_id: resource_id,
              league: group.name,
            },
          })
          .pipe(
            map((response) => [response, null]),
            catchError((error) => {
              const errorMessage =
                error.error?.message || error.message || "Unknown error";
              return of([null, errorMessage]);
            })
          );
      })
    );
    return new Promise((resolve, reject) => {
      deletion$.subscribe(
        ([response, error]) => {
          if (!response) {
            this.toastr.error(`${error}`, `Group Delete Error`);
            reject(error);
            return;
          }
          if (response["data"]) {
            this.toastr.success(
              `Group ${group.displayedName} is successfully deleted`
            );
            this.groupUpdates$.next({ group, operation: "delete" });
            resolve(response);
          }
        },
        (error) => {
          this.toastr.error(`${error}`, `Group Delete Error`);
          reject(error);
        }
      );
    });
  }

  updateGroup(
    group: ResourceGroup
  ): Observable<{ data: ResourceGroup; error: string }> {
    const updateUrl = new URL("leagues", environment.ws + "/");
    return this.http
      .put(updateUrl.href, group.serialize(), {
        headers: {
          version: "2",
        },
      })
      .pipe(
        catchError((err, caught) => {
          return of({
            error: `Error occured when updating group ${group.name}/ for resource ${group.resource_id}`,
            data: null,
          });
        }),
        map(({ data, error }: { data: ResourceGroup; error?: string }) => {
          return {
            data: new ResourceGroup().deserialize(data),
            error: error,
          };
        })
      );
  }
}
