import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";

export class ResourceIdValidator {

  static createValidator(resource_ids: Array<string>): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors => {
      let errors = [];
      if (!control.value.match(/^([a-z]|\_|-)*$/gm)) {
        errors.push("onlyLowerCaseUnderscoreDash");
      }
      if (resource_ids.includes(control.value)) {
        errors.push("resourceIdAlreadyExists");
      }
    //   if the errors array is bigger than 0
    // we reduce the array to make an object that looks like
    // { error_name1: true, error_name2: true}...etc
    // otherwise, we return null
      return errors.length
        ? errors.reduce((error_obj, error_name) => {
            error_obj[error_name] = true;
            return error_obj;
          }, {})
        : null;
    };
  }
}
