import { Component, Inject, OnDestroy } from "@angular/core";
import { ResourceGroup, ResourceGroupCreateForm } from "../../../models/resource-group.model";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { FormGroup, FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { slugifyFieldFromAnother } from "src/app/util/form-reactivity";
import { OrcidModule } from "src/app/orcid/orcid.module";
import { CommonModule } from "@angular/common";
import { OrcidService } from "src/app/orcid/services/orcid.service";
import { OrcidProfile } from "src/app/models/orcid-profile.model";

@Component({
  standalone: true,
  selector: "update-group",
  templateUrl: "./update-group.component.html",
  styleUrls: ["../../../../styles/form-styles.scss"],
  imports: [ReactiveFormsModule, OrcidModule, CommonModule],
})
export class UpdateGroupComponent implements OnDestroy {
  group: ResourceGroup;
  form: FormGroup<ResourceGroupCreateForm>;
  destroy$ = new Subject<void>();
  resourceGroup = new ResourceGroup();
  curators$: Observable<OrcidProfile[]>;

  constructor(
    @Inject(DIALOG_DATA)
    protected data: { group: ResourceGroup },
    protected fb: FormBuilder,
    protected orcidService: OrcidService,
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
        this.curators$ = this.orcidService.getOrcidProfiles(this.group.defaultMembers);
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
