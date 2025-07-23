import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { AngularSvgIconModule } from "angular-svg-icon";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { CalendarModule } from "primeng/calendar";
import { createDestroy$ } from "projects/apicuron-util/src/lib/util/destroy-observable";
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  startWith,
  switchMap,
} from "rxjs";
import { MedalDefService } from "src/app/achievements-def/services/medal-def.service";
import { Paginated } from "src/app/interfaces/paginated";
import { MedalDef } from "src/app/models/medal-def.model";
import { Medal } from "src/app/models/medal.model";
import { Term } from "src/app/models/term.model";
import { environment } from "src/environments/environment.dev";
import { SelectActivitiesComponent } from "../select-activities/select-activities.component";
import { UserMedalCardComponent } from "../user-medal-card/user-medal-card.component";

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
    UserMedalCardComponent,
  ],
})
export class MedalFormComponent implements OnInit {
  medalPreview$: Observable<Paginated<Medal>>;
  constructor(
    protected formBuilder: FormBuilder,
    protected toastr: ToastrService,
    protected medalDefService: MedalDefService
  ) {}

  destroy$ = createDestroy$();
  ngOnInit(): void {
    if (!this.medal.resource_id) {
      throw new Error("Medal Resource id missing");
    }
    if (this.type == "update") {
      this.form = MedalDef.buildUpdateMedalForm(this.formBuilder, this.medal);
    }
    if (this.type == "create") {
      this.form = MedalDef.buildCreateMedalForm(
        this.formBuilder,
        this.medal.resource_id
      );
    }

    const formUpdated$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      map(() => this.form.value),
      filter(() => this.form.valid)
    );

    this.medalPreview$ = formUpdated$.pipe(
      map((formValue) => {
        console.log({ formValue });
        const medalDef = new MedalDef().deserialize(formValue);
        return {
          medalDef,
          skip: 0,
          limit: 20,
        };
      }),
      switchMap(({ medalDef, skip, limit }) => {
        return this.medalDefService.loadMedalDefPreview(medalDef, skip, limit);
      })
    );
  }

  orcid_main_url = environment.orcid_main_url;

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

  form: FormGroup;

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
