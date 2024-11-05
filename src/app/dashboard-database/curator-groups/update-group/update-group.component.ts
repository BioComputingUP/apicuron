import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  Output,
} from "@angular/core";
import {
  ResourceGroup,
  ResourceGroupCreateForm,
  ResourceGroupUpdateForm,
} from "../../../models/resource-group.model";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { FormGroup, FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { slugifyFieldFromAnother } from "src/app/util/form-reactivity";
import { OrcidModule } from "src/app/orcid/orcid.module";
import { CommonModule } from "@angular/common";
import { OrcidService } from "src/app/orcid/services/orcid.service";
import { OrcidProfile } from "src/app/models/orcid-profile.model";
import { LoadableComponent } from "../../../../../projects/apicuron-util/src/lib/loadable";

@Component({
  standalone: true,
  selector: "update-group",
  templateUrl: "./update-group.component.html",
  styleUrls: ["../../../../styles/form-styles.scss"],
  imports: [CommonModule, ReactiveFormsModule, OrcidModule, LoadableComponent],
})
export class UpdateGroupComponent implements OnDestroy {
  group: ResourceGroup;
  form: FormGroup<ResourceGroupUpdateForm>;
  destroy$ = new Subject<void>();
  resourceGroup = new ResourceGroup();
  curators$: Observable<OrcidProfile[]>;

  @Output() formResult = new EventEmitter<ResourceGroup>();

  constructor(
    @Inject(DIALOG_DATA)
    protected data: { group: ResourceGroup },
    protected fb: FormBuilder,
    protected orcidService: OrcidService,
    public dialogRef: DialogRef<string>
  ) {
    this.group = data.group;
    this.form = this.resourceGroup.generateUpdateForm(this.fb, this.group);
    this.curators$ = this.orcidService.getOrcidProfiles(
      this.group.defaultMembers
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  submit() {
    if (!this.form.valid) {
      return;
    }
    const updatedGroup = new ResourceGroup().deserialize(this.group);
    updatedGroup.updateWithForm(this.form);
    this.formResult.emit(updatedGroup);
  }

  closeForm() {
    this.dialogRef.close();
  }
}
