import {
  FormControl,
  FormControlStatus,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import _ from "lodash";
import { Observable } from "rxjs";
import { delay, distinctUntilChanged, filter, map, tap } from "rxjs/operators";

function assertControlExists(form: FormGroup, controlName: string): void {
  if (!form.get(controlName)) {
    throw new Error(`Form is missing a FormControl named "${controlName}"`);
  }
}

const errorMessages = {
  required: (label: string, error: ValidationErrors) =>
    `The ${label} is required`,
  email: (label: string, error: ValidationErrors) =>
    `The ${label} must be a valid email address`,
  minlength: (label: string, error: ValidationErrors) =>
    `The ${label} must be at least ${error.requiredLength} characters long`,
  maxlength: (label: string, error: ValidationErrors) =>
    `The ${label} must be at most ${error.requiredLength} characters long`,
  min: (label: string, error: ValidationErrors) =>
    `The ${label} cannot be less than ${error.min}`,
  max: (label: string, error: ValidationErrors) =>
    `The ${label} cannot be more than ${error.max}`,
};

export const displayErrorMessages = (control: FormControl, label: string) => {
  control.statusChanges.pipe(
    filter((status) => status === "INVALID"),
    map(() => {
      return Object.keys(control.errors).map((key) => {
        return errorMessages[key](label, control.errors[key]);
      });
    })
  );
};

export function slugifyFieldFromAnother(
  form: FormGroup,
  sourceControlName: string,
  destControlName: string
): Observable<void> {
  assertControlExists(form, sourceControlName);
  assertControlExists(form, destControlName);
  const [sourceControl, destControl] = [
    form.get(sourceControlName),
    form.get(destControlName),
  ];

  return sourceControl.valueChanges.pipe(
    delay(50),
    distinctUntilChanged(),
    filter(() => sourceControl.valid), // make sure sourceControl is valid when value changes
    map((sourceValue: string) => {
      destControl.setValue(_.kebabCase(sourceValue.toLowerCase()));
    })
  );
}
