import { Component, Inject } from "@angular/core";
import { ResourceGroup, ResourceGroupCreateForm } from "../../../models/resource-group.model";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { FormGroup, FormBuilder } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { slugifyFieldFromAnother } from "src/app/util/form-reactivity";
import { OrcidModule } from "src/app/orcid/orcid.module";

@Component({
  standalone: true,
  selector: "update-group",
  templateUrl: "./update-group.component.html",
  styleUrls: ["../../../../styles/form-styles.scss"],
  imports: [OrcidModule],
})
export class UpdateGroupComponent {
  group: ResourceGroup;
  form: FormGroup<ResourceGroupCreateForm>;
  destroy$ = new Subject<void>();

  constructor(
    @Inject(DIALOG_DATA) 
    protected data: { group: ResourceGroup },
    protected fb: FormBuilder, 
    public dialogRef: DialogRef<string>
  ) {
      this.group = data.group;
      this.form = ResourceGroup.generateCreateForm(this.fb);
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

  closeForm() {
    this.dialogRef.close();
  }

  submit() {
    const resourceGroup = new ResourceGroup().fromForm(this.form);
    console.log(resourceGroup);
  }
}
