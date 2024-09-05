import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ToastrModule } from "ngx-toastr";
import { CalendarModule } from "primeng/calendar";
import { MultiSelectModule } from "primeng/multiselect";
import { MedalDef } from "src/app/models/medal-def.model";
import { Term } from "src/app/models/term.model";

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
    MultiSelectModule,
    CalendarModule,
  ],
})
export class MedalFormComponent implements OnInit {
  constructor(protected formBuilder: FormBuilder) {}
  ngOnInit(): void {
    if (!this.medal.resource_id) {
      throw new Error("Medal Resource id missing");
    }
    if (this.type == "update") {
      this.form.setValue({
        name: this.medal.name ?? null,
        list_terms: this.medal.list_terms ?? null,
        color: this.medal.color ?? null,
        score_relative: this.medal.score_relative ?? null,
        first_day: this.medal.first_day ?? null,
        last_day: this.medal.last_day ?? null,
      });
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

  form: FormGroup = this.formBuilder.group({
    color: [
      "gold",
      [
        Validators.required,
        Validators.pattern(
          /(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/
        ),
      ],
    ],
    score_relative: [1, [Validators.required, Validators.min(1)]],
    first_day: [null, []],
    last_day: [null, []],
    name: ["", [Validators.required]],
    list_terms: [[], [Validators.required]],
  });

  submit() {
    if (this.form.valid) {
      const medalValue = { ...this.medal, ...this.form.value };
      const medalDef = new MedalDef().deserialize(medalValue);

      this.formResult.emit({ medal: medalDef, operation: this.type });
    }
  }
}
