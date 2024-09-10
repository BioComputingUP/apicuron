import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { CalendarModule } from "primeng/calendar";
import { MultiSelectModule } from "primeng/multiselect";
import { Badge as BadgeDef } from "src/app/models/badge.model";
import { Term } from "src/app/models/term.model";

@Component({
  standalone: true,
  selector: "badge-form",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MultiSelectModule,
    CalendarModule,
    ToastrModule,
  ],
  templateUrl: "./badge-form.component.html",
  styleUrls: ["./badge-form.component.scss"],
})
export class BadgeFormComponent implements OnInit {
  @Input()
  type: "create" | "update" = "create";

  @Input()
  badge: BadgeDef = new BadgeDef();

  @Input()
  terms: Term[] = [];

  @Output() formResult = new EventEmitter<{
    badge: BadgeDef;
    operation: "create" | "update";
  }>();

  form: FormGroup = this.formBuilder.group({
    name: ["", [Validators.required]],
    color_code: [
      "",
      [
        Validators.required,
        Validators.pattern(
          /(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/
        ),
      ],
    ],
    count_threshold: [1, [Validators.required, Validators.min(1)]],
    list_terms: [[] as string[], [Validators.minLength(1)]],
    startDate: [null, []],
    endDate: [null, []],
  });

  constructor(
    protected formBuilder: FormBuilder,
    protected toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (!this.badge.resource_id) {
      throw new Error("Badge Resource id missing");
    }

    this.form.setValue({
      name: this.badge.name ?? "",
      list_terms: this.badge.list_terms ?? "",
      color_code: this.badge.color_code ?? "",
      count_threshold: this.badge.count_threshold ?? "",
    });
  }

  submit() {
    if (this.form.valid) {
      const badgeValue = { ...this.badge, ...this.form.value };
      const badgeDef = new BadgeDef().deserialize(badgeValue);

      this.formResult.emit({ badge: badgeDef, operation: this.type });
    }
  }
}
