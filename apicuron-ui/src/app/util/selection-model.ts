import { SelectionChange, SelectionModel } from "@angular/cdk/collections";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

export class SelectModel<T> extends SelectionModel<T> {
  selected$: Observable<T[]>;
  constructor(
    _multiple?: boolean,
    initiallySelectedValues?: T[],
    _emitChanges?: boolean,
    compareWith?: ((o1: T, o2: T) => boolean) | undefined
  ) {
    super(_multiple, initiallySelectedValues, _emitChanges, compareWith);

    this.selected$ = this.changed.asObservable().pipe(
      startWith(this.selected),
      map(() => this.selected)
    );
  }
}
