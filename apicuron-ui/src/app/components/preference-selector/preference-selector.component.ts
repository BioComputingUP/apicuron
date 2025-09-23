import { CdkListbox, CdkOption } from "@angular/cdk/listbox";
import { Component, forwardRef, Input } from "@angular/core";
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  standalone: true,
  selector: "preference-selector",
  templateUrl: "./preference-selector.component.html",
  styleUrls: ["./preference-selector.component.scss"],
  imports: [CdkListbox, CdkOption, FormsModule, AngularSvgIconModule],
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
  @Input() sectionLabel: string;
  @Input() sectionIcon: string;

  selectedPreferences: readonly T[] = [];
  allSelected = false;

  private onChange = (value: readonly T[]) => {};
  private onTouched = () => {};

  onSelectionChange(value: readonly T[]) {
    this.allSelected = value && value.length === this.preferences.length;
    this.selectedPreferences = value;
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: readonly T[]): void {
    this.allSelected = value && value.length === this.preferences.length;
    this.selectedPreferences = value || [];
  }
  registerOnChange(fn: (value: readonly T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggleSelection() {
    this.selectedPreferences = this.allSelected ? [] : this.preferences;
    this.allSelected =
      this.selectedPreferences.length === this.preferences.length;
    this.onSelectionChange(this.selectedPreferences);
  }
}
