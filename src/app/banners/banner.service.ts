import { Injectable } from "@angular/core";
import { BehaviorSubject, interval, Observable, of, Subject } from "rxjs";
import { environment } from "../../environments/environment";
import {
  map,
  mapTo,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from "rxjs/operators";
import { initial } from "lodash";

@Injectable()
export class BannerService {
  constructor(
    protected startDate?: Date,
    protected endDate?: Date,
    protected initialState: boolean = environment.env != "production"
  ) {}

  // checks if date is in the specified range, emits true if in range, false otherwise
  // if there are no dates specified, emits true
  private inDateRange$: Observable<boolean> = interval(1000 * 3600).pipe(
    startWith(() => new Date()),
    mapTo(new Date()),
    map((currentDate: Date) => {
      if (!!this.startDate && !!this.endDate) {
        console.log("alldefined");
        return currentDate >= this.startDate && currentDate <= this.endDate;
      } else if (!!this.startDate && !this.endDate) {
        return currentDate >= this.startDate;
      } else if (!!this.endDate && !this.startDate) {
        console.log("end defined");
        return currentDate <= this.endDate;
      }
      return true;
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
