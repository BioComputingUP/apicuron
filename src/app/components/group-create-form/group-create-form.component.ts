import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnDestroy, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ResourceGroup, ResourceGroupCreateForm } from "../../models/resource-group.model";
import { slugifyFieldFromAnother } from "../../util/form-reactivity";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { DialogRef } from "@angular/cdk/dialog";
import { OrcidModule } from "../../orcid/orcid.module";
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrcidModule],
  selector: "group-create-form",
  templateUrl: "./group-create-form.component.html",
  styleUrls: ["../../../styles/form-styles.scss"],
})
export class GroupCreateForm implements OnDestroy {
  form: FormGroup<ResourceGroupCreateForm>;
  destroy$ = new Subject<void>();
  
  @Output() formResult = new EventEmitter<{ group: ResourceGroup }>();

  constructor(protected fb: FormBuilder, public dialogRef: DialogRef<string>) {
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

  submit() {
    if (this.form.valid) {
      const resourceGroup = new ResourceGroup().fromForm(this.form);
      console.log(resourceGroup);
  
      // this.formResult.emit({ group: resourceGroup })
    }
  }

  closeForm() {
    this.dialogRef.close();
  }
}
