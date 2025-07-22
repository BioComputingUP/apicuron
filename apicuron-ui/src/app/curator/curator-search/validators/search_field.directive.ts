import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function search_field_validator(search_fields: Array<string>): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    const valid = search_fields.includes(control.value);
    return !valid ? {search_field : {value: control.value}} : null;
  };
}
