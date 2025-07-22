import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ResourceGroup } from "../../models/resource-group.model";
import { CommonModule } from "@angular/common";

export type GroupClickEvent = {
  group: ResourceGroup;
  action: "edit" | "delete" | "select";
  event: any
};

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: "resource-group-card",
  templateUrl: "./resource-group-card.component.html",
})
export class ResourceGroupCardComponent {
  @Input() group: ResourceGroup;

  @Output() groupEvent = new EventEmitter<GroupClickEvent>();

  handleEvent(action: GroupClickEvent["action"], event: MouseEvent) {
    this.groupEvent.emit({ group: this.group, action, event });
	event.stopPropagation();
  }
}
