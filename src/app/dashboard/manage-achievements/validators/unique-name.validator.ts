import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function uniqueNameValidator(badges_list: Array<{name: string}>): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const badge_name = control.value;


      return badges_list.includes(badge_name) ? { 'name-unique': true} : null
      
    };
  }