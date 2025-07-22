import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { CalendarModule } from "primeng/calendar";
import { takeUntil, tap } from "rxjs";
import { MedalDef } from "src/app/models/medal-def.model";
import { Term } from "src/app/models/term.model";
import { SelectionModel } from "@angular/cdk/collections";
import { createDestroyObservable } from "projects/apicuron-util/src/lib/util/destroy-observable";
import { SelectActivitiesComponent } from "../select-activities/select-activities.component";

@Component({
  selector: "medal-form",
  templateUrl: "./medal-form.component.html",
  styleUrls: ["./medal-form.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule,
    SelectActivitiesComponent,
    CalendarModule,
  ],
})
export class MedalFormComponent implements OnInit {
  constructor(
    protected formBuilder: FormBuilder,
    protected toastr: ToastrService
  ) {}

  destroy$ = createDestroyObservable();
  ngOnInit(): void {
    if (!this.medal.resource_id) {
      throw new Error("Medal Resource id missing");
    }
    if (this.type == "update") {
      MedalDef.buildUpdateMedalForm(this.form, this.medal);
    }
  }

  @Input()
  type: "create" | "update" = "create";

  @Input()
  medal: MedalDef = new MedalDef();

  maxDate: Date = new Date();

  @Input()
  terms: Term[] = [];

  @Output() formResult = new EventEmitter<{
    medal: MedalDef;
    operation: "create" | "update";
  }>();

  @Output() closeForm = new EventEmitter<void>();

  form = MedalDef.buildCreateMedalForm(this.formBuilder);

  submit() {
    if (this.form.valid) {
      const medalValue = { ...this.medal, ...this.form.value };
      const medalDef = new MedalDef().deserialize(medalValue);

      this.formResult.emit({ medal: medalDef, operation: this.type });
    } else {
      this.toastr.error(`Please fill all required fields`, "Form Error");
    }
  }
  onClose() {
    this.closeForm.emit();
  }
}
