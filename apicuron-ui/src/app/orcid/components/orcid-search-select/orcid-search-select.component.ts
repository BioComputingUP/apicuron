import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SelectionModel } from "@angular/cdk/collections";
import { Observable, BehaviorSubject, Subject, merge } from "rxjs";
import {
  startWith,
  distinctUntilChanged,
  map,
  filter,
  delay,
  tap,
  takeUntil,
  switchMap,
} from "rxjs/operators";
import { OrcidProfile } from "../../../models/orcid-profile.model";
import { LoadingState, switchMapWithLoading } from "../../../util/operators";
import { OrcidService } from "../../services/orcid.service";
import { Overlay } from "@angular/cdk/overlay";


export const CUSTOM_CONROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => OrcidSearchSelectComponent),
  multi: true,
};
@Component({
  selector: "orcid-search-select",
  templateUrl: "./orcid-search-select.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ["../../../../../node_modules/@angular/cdk/overlay-prebuilt.css"],
  providers: [CUSTOM_CONROL_VALUE_ACCESSOR],
})
export class OrcidSearchSelectComponent
  implements ControlValueAccessor, OnDestroy
{
  selectedCuratorsList$: Observable<OrcidProfile[]>;

  searchQuery$ = new BehaviorSubject<string>("");

  selectedCurators = new SelectionModel<OrcidProfile>(
    true,
    [],
    true,
    (o1, o2) => o1.orcid_id === o2.orcid_id
  );

  suggestions$: Observable<LoadingState<OrcidProfile[]>>;

  detachOrBackdropClick$ = new Subject<void>();
  overlayState$: Observable<boolean>;
  destroy$ = new Subject<void>();

  // Control value accessor functions
  onTouch: any;
  onChange: any;
  @Input() disabled: boolean;

  removeSelectedCurator(profile: OrcidProfile) {
    this.selectedCurators.deselect(profile);
  }

  selectSuggestion(suggestion: OrcidProfile) {
    this.selectedCurators.toggle(suggestion);
  }

  closeOverlay() {
    this.detachOrBackdropClick$.next();
  }

  profileSelected(profile: OrcidProfile): Observable<"true" | "false"> {
    return this.selectedCurators.changed.pipe(
      startWith(this.selectedCurators.isSelected(profile) ? "true" : "false"),
      map(() => (this.selectedCurators.isSelected(profile) ? "true" : "false"))
    );
  }

  constructor(
    protected orcidService: OrcidService,
    protected overlay: Overlay
  ) {
    this.suggestions$ = this.searchQuery$.pipe(
      filter((term) => !!term && term.length >= 3),
      delay(100),
      distinctUntilChanged(),
      switchMapWithLoading((query: string): Observable<OrcidProfile[]> => {
        return this.orcidService.searchOrcidProfile(query);
      })
    );

    this.overlayState$ = merge(
      this.suggestions$,
      this.detachOrBackdropClick$
    ).pipe(map((response: LoadingState<OrcidProfile[]> | void) => !!response));

    this.selectedCuratorsList$ = this.selectedCurators.changed.pipe(
      map(() => this.selectedCurators.selected)
    );

    this.selectOrcidIds$
      .pipe(
        switchMap((ids: string[]) => this.orcidService.getOrcidProfiles(ids)),
        tap((profiles: OrcidProfile[]) => {
          this.selectedCurators.clear();
          this.selectedCurators.select(...profiles);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }

  change(event: Event) {
    const targetElement = event.target as HTMLInputElement;
    this.searchQuery$.next(targetElement.value);
  }

  selectOrcidIds$ = new Subject<string[]>();

  writeValue(obj: string[]): void {
    if (!obj) return;
    this.selectOrcidIds$.next(obj);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;

    /**
     * Handles The registered onChange in the ControlValueAccessor
     */
    this.selectedCuratorsList$
      .pipe(
        map((profiles: OrcidProfile[]) =>
          profiles.map((profile) => profile.orcid_id)
        ),
        tap((selectedCurators: string[]) => {
          if (this.onChange) {
            this.onChange(selectedCurators);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
  onInputFocus() {
    if (!this.onTouch) return;
    this.onTouch();
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
