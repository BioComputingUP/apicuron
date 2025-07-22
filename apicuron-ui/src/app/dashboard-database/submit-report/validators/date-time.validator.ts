import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function dateTimeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const date: string = control.get("date").value;
    const time = control.get("time").value;

    const datetime = new Date([date, time].join(" "));

    if (datetime.getTime() > new Date().getTime()) {
      return { "future-date": true };
    }

    return null;
  };
}
