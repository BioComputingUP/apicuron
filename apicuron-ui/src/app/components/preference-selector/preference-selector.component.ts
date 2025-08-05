import { CdkListbox, CdkOption } from "@angular/cdk/listbox";
import { Component, forwardRef, Input } from "@angular/core";
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";

@Component({
  standalone: true,
  selector: "preference-selector",
  templateUrl: "./preference-selector.component.html",
  styleUrls: ["./preference-selector.component.scss"],
  imports: [CdkListbox, CdkOption, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PreferenceSelectorComponent),
      multi: true,
    },
  ],
})
export class PreferenceSelectorComponent<T extends string = string>
  implements ControlValueAccessor
{
  @Input() preferences: readonly T[];

  selectedPreferences: readonly T[] = [];

  private onChange = (value: readonly T[]) => {};
  private onTouched = () => {};

  onSelectionChange(value: readonly T[]) {
    this.selectedPreferences = value;
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: readonly T[]): void {
    this.selectedPreferences = value || [];
  }
  registerOnChange(fn: (value: readonly T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  selectAll() {
    this.selectedPreferences = this.preferences;
    this.onChange(this.selectedPreferences);
    this.onTouched();
  }
}
