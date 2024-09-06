import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { ResourceGroup, ResourceGroupCreateForm } from "../../../models/resource-group.model";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { FormGroup, FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { slugifyFieldFromAnother } from "src/app/util/form-reactivity";
import { OrcidModule } from "src/app/orcid/orcid.module";

@Component({
  standalone: true,
  selector: "update-group",
  templateUrl: "./update-group.component.html",
  styleUrls: ["../../../../styles/form-styles.scss"],
  imports: [ReactiveFormsModule, OrcidModule],
})
export class UpdateGroupComponent implements OnDestroy {
  group: ResourceGroup;
  form: FormGroup<ResourceGroupCreateForm>;
  destroy$ = new Subject<void>();
  resourceGroup = new ResourceGroup();

  constructor(
    @Inject(DIALOG_DATA) 
    protected data: { group: ResourceGroup },
    protected fb: FormBuilder, 
    public dialogRef: DialogRef<string>
  ) {
    this.group = data.group;
    this.form = this.resourceGroup.generateUpdateForm(this.fb, this.group);
    const slugifier$ = slugifyFieldFromAnother(
      this.form,
      "displayedName",
      "name"
      );
      slugifier$.pipe(takeUntil(this.destroy$)).subscribe(() => {});
    }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  submit() {
    const resourceGroup = new ResourceGroup().fromForm(this.form);
    console.log("Modified Resource Group", resourceGroup);
  }

  closeForm() {
    this.dialogRef.close();
  }
}
