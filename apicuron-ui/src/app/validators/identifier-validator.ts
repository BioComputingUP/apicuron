import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export interface TextValidationErrors extends ValidationErrors {
  [key: string]: string;
}

const identifierRegex = /^([a-z][a-z0-9]*)(-[a-z0-9]+)*$/;

export function IdentifierValdiator(): ValidatorFn {
  return (control: AbstractControl): TextValidationErrors | null => {
    if (identifierRegex.test(control.value) || control.value === "") {
      return null;
    }
    return {
      invalidIdentifier:
        "Invalid identifier, should only contain lowercase letters, numbers and hyphens (-)",
    };
  };
}
