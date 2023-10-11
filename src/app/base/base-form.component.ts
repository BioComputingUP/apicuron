import { EventEmitter, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";

export interface BaseFormComponent<T> {
  type: "create" | "update";
  formResult: EventEmitter<{ item: T; type: "create" | "update" }>;
  form: FormGroup;

  submit(): void | any;
}
