import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { GroupsService } from "../services/groups.service";
import { ResourceGroup } from "../../../models/resource-group.model";
import { GroupClickEvent } from "../../../components/group-card/resource-group-card.component";

@Component({
  selector: "show-groups",
  templateUrl: "./show-groups.component.html",
  styleUrls: ["./show-groups.component.scss"],
})
export class ShowGroupsComponent implements OnInit {
  groups$: Observable<ResourceGroup[]>;
  selectedGroup$: Observable<ResourceGroup>;

  constructor(private groupsService: GroupsService) {}

  ngOnInit(): void {
    this.groups$ = this.groupsService.getResourceGroups();
    this.selectedGroup$ = this.groupsService.getCurrentGroup();
  }

  groupClickEventHandler(clickEvent: GroupClickEvent) {
    console.log(`called ${clickEvent.action} button`, clickEvent.group);
  }
}
