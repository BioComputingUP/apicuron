import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, shareReplay, startWith, take, takeUntil, tap } from "rxjs/operators";
import { BehaviorSubject, Observable, Subject, combineLatest, concat } from "rxjs";
import { switchMap, pluck } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { User } from "src/app/models/User.model";
import { ResourceGroup } from "../../../models/resource-group.model";
import { Dialog } from "@angular/cdk/dialog";
import { CreateGroupComponent } from "../create-group/create-group.component";
import { UpdateGroupComponent } from "../update-group/update-group.component";
import { GroupCreateForm } from "../../../components/group-create-form/group-create-form.component";
import { response } from "express";
import { ToastrService } from "ngx-toastr";

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
    protected toastr: ToastrService,
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
      }
    }
    return resourceGroupList;
  }

  getResourceGroups(): Observable<{ data: ResourceGroup[]}> {
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
          console.log("Successfully created resource group");
          dialogRef.close();
          this.groupUpdates$.next({ group, operation: "create" });
          return group;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {});
  }

  openUpdateGroupForm(resourceGroup: ResourceGroup) {

    // Pass the resourceGroup as an input (use the CreateGroupForm as an example)
    this.dialog.open(UpdateGroupComponent, {
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

  deleteGroup(group: ResourceGroup) {
    return this.http.delete(`${this.ws}/leagues`, {
        headers: { version: "2" },
      })
      .pipe(take(1),
      tap(response => {
        console.log("HTTP DELETE Response:", response); 
      })
      )
      .subscribe(
        (response) => {
          if (response["data"]) {
            this.toastr.success(
              `Group ${group.name} is successfully deleted`,
            );
            this.groupUpdates$.next({ group, operation: "delete" });
          }
        },
        (error) => {
          console.error("HTTP Error:", error);
          this.toastr.error(
            `An error occured while deleting the group ${group.name}`, error,
          );
        }
      )
    }
}
