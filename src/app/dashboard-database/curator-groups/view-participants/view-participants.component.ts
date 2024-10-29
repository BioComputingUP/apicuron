import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject, OnDestroy } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { OrcidProfile } from "src/app/models/orcid-profile.model";
import { ResourceGroup, ResourceGroupCreateForm } from "src/app/models/resource-group.model";
import { OrcidService } from "src/app/orcid/services/orcid.service";
import { OrcidModule } from "src/app/orcid/orcid.module";
import { CommonModule } from "@angular/common";
@Component({
  standalone: true,
  selector: "view-participants",
  templateUrl: "./view-participants.component.html",
  imports: [ReactiveFormsModule, OrcidModule, CommonModule],
})
export class ViewParticipantsComponent implements OnDestroy {
  group: ResourceGroup;
  form: FormGroup<ResourceGroupCreateForm>;
  destroy$ = new Subject<void>();
  curators$: Observable<OrcidProfile[]>;

  constructor(
    @Inject(DIALOG_DATA)
    protected data: { group: ResourceGroup },
    protected orcidService: OrcidService,
    public dialogRef: DialogRef<string>
  ) {
    this.group = data.group;
    this.curators$ = this.orcidService.getOrcidProfiles(this.group.defaultMembers);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  closeForm() {
    this.dialogRef.close();
  }
}
