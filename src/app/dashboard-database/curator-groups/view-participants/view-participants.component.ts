import { DialogRef } from "@angular/cdk/dialog";
import { Component, OnDestroy, OnInit, Optional } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ResourceGroup, ResourceGroupCreateForm } from "src/app/models/resource-group.model";
import { slugifyFieldFromAnother } from "src/app/util/form-reactivity";

@Component({
  selector: "view-participants",
  templateUrl: "./view-participants.component.html",
})
export class ViewParticipantsComponent implements OnInit, OnDestroy {
  group: ResourceGroup;
  form: FormGroup<ResourceGroupCreateForm>;
  destroy$ = new Subject<void>();

  ngOnInit(): void {
    throw new Error("Method not implemented.");
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  closeForm() {
    // this.dialogRef.close();
  }
}
