import { ComponentType } from "@angular/cdk/portal";
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  input,
  Input,
  OnDestroy,
  Output,
  Type,
} from "@angular/core";
import { create } from "lodash";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  skipWhile,
  Subject,
  takeUntil,
} from "rxjs";
import { createDestroy$ } from "../util/destroy-observable";

@Component({
  template: "",
})
export abstract class Selectable {
  private _defaultInitialValue = false;
  destroy$ = createDestroy$();
  disabled$ = new BehaviorSubject<boolean>(false);

  constructor() {
    combineLatest([this.selected$, this.disabled$])
      .pipe(
        // Skip while the component is disabled
        skipWhile(([_, disabled]) => disabled),
        // Map to the selected state
        map(([selected, _]) => selected),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(this.selectionUpdated);
  }

  selected$ = new BehaviorSubject<boolean>(this._defaultInitialValue);

  @Output()
  selectionUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input()
  set isSelected(value: boolean) {
    this.selected$.next(value);
  }

  @Input()
  set disabled(value: boolean) {
    this.disabled$.next(value);
  }

  setSelection(value: boolean) {
    if (!this.disabled$.getValue()) {
      this.selected$.next(value);
    }
  }

  toggle() {
    this.setSelection(!this.selected$.getValue());
  }
}
