import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Term } from "src/app/models/term.model";
import {
  BehaviorSubject,
  ReplaySubject,
  Subject,
  map,
  skipUntil,
  takeUntil,
  tap,
} from "rxjs";
import { SelectionModel } from "@angular/cdk/collections";
import { ActivityListElementComponent } from "./activity-list-element/activity-list-element.component";

@Component({
  selector: "[select-activities]",
  templateUrl: "./select-activities.component.html",
  standalone: true,
  imports: [CommonModule, FormsModule, ActivityListElementComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SelectActivitiesComponent,
    },
  ],
})
export class SelectActivitiesComponent
  implements ControlValueAccessor, OnDestroy
{
  touchedCallback: () => void;
  changeCallback: (value: string[]) => void;
  destroy$ = new Subject<void>();
  initialValueSet$ = new Subject<void>();

  constructor() {
    // Handles ControlValueAccessor callbacks
    this.termSelector.changed
      .pipe(
        // This prevents the first writeValue call from triggering the change callback
        //   When the first writeValue is called, the callbacks are not yet initialized and the pipeline would fail
        skipUntil(this.initialValueSet$),
        tap(() => {
          this.touchedCallback();
          const termIds: string[] = this.termSelector.selected.map(
            (term: Term) => term.activity_term
          );
          this.changeCallback(termIds);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }

  disabledState$ = new BehaviorSubject<boolean>(false);
  @Input() set activities(value: Term[]) {
    this.inputActivities$.next(value);
  }

  termSelector = new SelectionModel<Term>(true, [], true, (a, b) =>
    a.equals(b)
  );

  inputActivities$ = new BehaviorSubject<Term[]>([]);

  writeValue(selectedActivityNames: string[]): void {
    const allActivities = this.inputActivities$.getValue();

    const selectedTerms = allActivities.filter((activity: Term) => {
      return selectedActivityNames.includes(activity.activity_term);
    });

    // In case of errors
    if (selectedTerms.length != selectedActivityNames.length) {
      console.warn(
        `[SelectActivitiesComponent]Not all selected terms were found in the provided activities.`
      );
      const invalidValues = selectedActivityNames.filter(
        (activity_term) =>
          allActivities.findIndex(
            (activity: Term) => activity.activity_term === activity_term
          ) === -1
      );
      if (invalidValues.length > 0) {
        console.warn(
          `[SelectActivitiesComponent]Invalid selection values provided: ${invalidValues.join(
            ", "
          )}`
        );
      }
    }

    this.termSelector.select(...selectedTerms);
    this.initialValueSet$.next();
  }

  registerOnChange(fn: any): void {
    this.changeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    this.touchedCallback = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabledState$.next(isDisabled);
  }

  selectionUpdated(isSelected: boolean, term: Term) {
    if (isSelected) {
      this.termSelector.select(term);
    } else {
      this.termSelector.deselect(term);
    }
  }
}
