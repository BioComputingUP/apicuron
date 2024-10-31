import { DialogRef } from "@angular/cdk/dialog";
import { Component, Optional } from "@angular/core";

@Component({
  selector: "create-group",
  templateUrl: "./create-group.component.html",
  styleUrls: ["./create-group.component.scss"],
})
export class CreateGroupComponent {

  constructor(@Optional() protected dialogRef?: DialogRef){
    if(!!dialogRef){
      // behave as a dialog
    }
  }
}
