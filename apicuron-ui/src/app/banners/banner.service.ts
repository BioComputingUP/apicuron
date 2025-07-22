import { interval, Observable, of, Subject } from "rxjs";
import { environment } from "../../environments/environment";
import {
  map,
  mapTo, startWith,
  switchMap
} from "rxjs/operators";

export class BannerService {
  constructor(
    public startDate?: Date,
    public endDate?: Date,
    protected initialState: boolean = environment.env != "production"
  ) {}

  // checks if date is in the specified range, emits true if in range, false otherwise
  // if there are no dates specified, emits true
  private inDateRange$: Observable<boolean> = interval(1000 * 3600).pipe(
    startWith(() => new Date()),
    mapTo(new Date()),
    map((currentDate: Date) => {
      // if startDate or endDate are not specified, return true
      // if any of the dates are specified, check if the current date is in the range
      return (!this.startDate || currentDate >= this.startDate) && (!this.endDate || currentDate <= this.endDate);
    }),
  );

  // this subject emits true when the banner should be displayed, false when user hides it
  private bannerCloseEvent$ = new Subject<boolean>();

  // this observable emits when the closeEvent is emitted
  // starts with the initial state
  // and takes into consideration the inDateRange observable
  public displayBanner = this.bannerCloseEvent$.pipe(
    startWith(this.initialState),
    switchMap((bannerState: boolean) => {
      if (bannerState) {
        return this.inDateRange$;
      } else {
        return of(false);
      }
    })
  );

  closeBanner() {
    this.bannerCloseEvent$.next(false);
  }
}
