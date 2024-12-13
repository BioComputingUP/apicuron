import { Component, EventEmitter, OnDestroy, Output } from "@angular/core";
import { FairSharingService } from "../services/fairsharing.service";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  debounceTime,
  distinctUntilChanged,
  shareReplay,
  takeUntil,
  tap,
} from "rxjs/operators";
import { LoadingState } from "../../../../projects/apicuron-util/src/lib/loadable";

@Component({
  standalone: true,
  selector: "fairsharing",
  templateUrl: "./fairsharing.component.html",
  imports: [CommonModule, FormsModule],
})
export class FairSharingComponent implements OnDestroy {
  @Output() myData = new EventEmitter<any>();
  doi: string = "";
  processing$: Observable<LoadingState<any>>;
  destroy$ = new Subject<void>();
  inputSubject$ = new ReplaySubject<string>();

  constructor(protected fairsharingService: FairSharingService) {
    this.processing$ = this.fairsharingService
      .getFairsharingObservable(this.inputSubject$.asObservable())
      .pipe(shareReplay());
  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }

  onDOIInputChange(event: InputEvent): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.inputSubject$.next(value);
  }


  emitToForm(input: any) {
    this.myData.emit(input);
  }
}
