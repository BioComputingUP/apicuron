import { Component, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject, of } from "rxjs";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from "rxjs/operators";
import { GroupsService } from "./services/groups.service";
import { ResourceGroup } from "../../models/resource-group.model";
import { GroupClickEvent } from "../../components/group-card/resource-group-card.component";
import { ToastrService } from "ngx-toastr";

type GroupListUpdate = {
  group: ResourceGroup;
  operation: "update" | "delete" | "create";
}

@Component({
  selector: "curator-groups",
  templateUrl: "./curator-groups.component.html",
  styleUrls: ["./curator-groups.component.scss"],
})
export class CuratorGroupsComponent implements OnInit {
  resource_id$: Observable<string>;
  groups$: Observable<{ data: ResourceGroup[]}>;
  updateGroup$ = new Subject<GroupListUpdate>();
  manageForm$ = new BehaviorSubject<{
    group: ResourceGroup;
    show: boolean;
    type: "create" | "update";
  }>({ group: null, show: false, type: "create"});
  
  constructor(
    protected http: HttpClient,
    protected route: ActivatedRoute,
    protected toastr: ToastrService,
    private groupsService: GroupsService,
  ) {}

  ngOnInit(): void {
    this.resource_id$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("resource_id");
      })
    );

    this.groupsService.init(this.resource_id$);
    this.groups$ = this.groupsService.getResourceGroups();
  }

  groupClickEventHandler(clickEvent: GroupClickEvent) {
    switch (clickEvent.action) {
      case "edit":
        this.groupsService.openUpdateGroupForm(clickEvent.group);
        break;
      case "delete":
        this.groupsService.deleteGroup(clickEvent.group);
    }
  }

  createGroupClickHandler($event: PointerEvent) {
    this.groupsService.openCreateGroupForm();
  }

  private addGroupToUI(group) {
    this.updateGroup$.next({ operation: "create", group });
  }

  createGroup(group: ResourceGroup) {
    this.groupsService.createNewGroup(group).subscribe(
      (data: ResourceGroup) => {
        if (data) {
          this.toastr.success(
            `Group ${data.name} successfully created`,
          );
          this.addGroupToUI(data);
        }
      },
      (error) => {
        this.toastr.error(
          `An error occured while creating the group ${group.name}`, error,
        )
      }
    );
  }

  formSubmit({
    group,
    operation,
  }: {
    group: ResourceGroup;
    operation: "create" | "update";
  }) {
    console.log({ group, operation })
    if (operation == "create") {
      console.log("Group created successfully.");
      this.createGroup(group);
    }
    this.manageForm$.next({ group: null, show: false, type: "create" });
  }
}
