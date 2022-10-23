import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function orcidIdValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const orcid_id = control.value;
      const orcid_digits = orcid_id.split("").filter((char) => char != "-");
      const [digits, checksum]: [number[], string] = [
        orcid_digits.slice(0, -1).map((x) => parseInt(x)),
        orcid_digits.slice(-1)[0],
      ];
  
      let sum = digits.reduce((prev, curr) => (prev + curr) * 2, 0);
  
      let check_value: number = (sum % 11) - (2 % 11);
      const check: string = check_value == 10 ? "X" : String(check_value);
      
      return check == checksum
        ? null
        : { 'checksum': true };
    };
  }