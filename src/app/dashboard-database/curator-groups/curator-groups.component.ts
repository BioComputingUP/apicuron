import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { GroupsService } from "./services/groups.service";
import { ResourceGroup } from "../../models/resource-group.model";
import { GroupClickEvent } from "../../components/group-card/resource-group-card.component";

@Component({
  selector: "curator-groups",
  templateUrl: "./curator-groups.component.html",
  styleUrls: ["./curator-groups.component.scss"],
})
export class CuratorGroupsComponent implements OnInit {
  resource_id$: Observable<string>;
  // biocurators_list$: Observable<Array<any>>;

  groups$: Observable<ResourceGroup[]>;

  constructor(
    protected http: HttpClient,
    protected route: ActivatedRoute,
    private groupsService: GroupsService
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
    }
  }

  createGroupClickHandler($event: PointerEvent) {
    this.groupsService.openCreateGroupForm();
  }
}
