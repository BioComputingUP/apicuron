import { Component, Inject } from "@angular/core";
import { ResourceGroup } from "../../../models/resource-group.model";
import { DIALOG_DATA } from "@angular/cdk/dialog";

@Component({
  selector: "update-group",
  templateUrl: "./update-group.component.html",
  styleUrls: [],
})
export class UpdateGroupComponent {
  group: ResourceGroup;
  constructor(@Inject(DIALOG_DATA) protected data: { group: ResourceGroup }) {
    this.group = data.group;
  }
}
