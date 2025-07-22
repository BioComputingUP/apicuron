import { Pipe, PipeTransform } from "@angular/core";
import { AbstractControl, FormControl } from "@angular/forms";
import { filter, map, Observable, tap } from "rxjs";

@Pipe({
  name: "ErrorMessage",
})
export class ErrorMessagePipe implements PipeTransform {
  transform(value: AbstractControl, label: string): Observable<string[]> {
    return this.displayErrorMessages(value, label);
  }

  errorMessages = {
    required: (label: string, error: any) => `The ${label} is required`,
    email: (label: string, error: any) =>
      `The ${label} must be a valid email address`,
    minlength: (label: string, error: any) =>
      `The ${label} must be at least ${error.requiredLength} characters long`,
    maxlength: (label: string, error: any) =>
      `The ${label} must be at most ${error.requiredLength} characters long`,
    min: (label: string, error: any) =>
      `The ${label} cannot be less than ${error.min}`,
    max: (label: string, error: any) =>
      `The ${label} cannot be more than ${error.max}`,
  };

  displayErrorMessages = (control: AbstractControl, label: string) => {
    return control.statusChanges.pipe(
      map(() => {
        if(!control.errors){
          return [];
        }
        return Object.keys(control.errors).map((key) => {
          return this.errorMessages[key](label, control.errors[key]);
        });
      })
    );
  };
}
