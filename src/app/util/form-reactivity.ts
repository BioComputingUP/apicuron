import { FormGroup } from "@angular/forms";
import _ from "lodash";
import { Observable } from "rxjs";
import { delay, distinctUntilChanged, filter, map, startWith } from "rxjs/operators";

function assertControlExists(form: FormGroup, controlName: string): void {
  if (!form.get(controlName)) {
    throw new Error(`Form is missing a FormControl named "${controlName}"`);
  }
}

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
	startWith(sourceControl.value),
    delay(50),
    distinctUntilChanged(),
    filter(() => sourceControl.valid), // make sure sourceControl is valid when value changes
    map((sourceValue: string) => {
      destControl.setValue(_.kebabCase(sourceValue.toLowerCase()));
    })
  );
}
