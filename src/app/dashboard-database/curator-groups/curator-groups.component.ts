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
  search_fields = {
    field: "displayedName",
    text: "Biocurator name",
  };

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
    console.log(`called ${clickEvent.action} button`, clickEvent.group);
  }
}
