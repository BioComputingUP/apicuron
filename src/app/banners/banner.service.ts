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
    protected initialState: boolean = !environment.production
  ) {}

  private inDateRange$: Observable<boolean> = interval(1000 * 3600).pipe(
    startWith(() => new Date()),
    mapTo(new Date()),
    map((currentDate: Date) => {
      if (!!this.startDate && !!this.endDate) {
        console.log('alldefined')
        return currentDate >= this.startDate && currentDate <= this.endDate;
      } else if (!!this.startDate && !this.endDate) {
        return currentDate >= this.startDate;
      } else if (!!this.endDate && !this.startDate) {
        console.log('end defined')
        return currentDate <= this.endDate;
      }
      return true;
    }),
    tap(console.log)
  );

  private bannerCloseEvent$ = new Subject<boolean>();

  public displayBanner = this.bannerCloseEvent$.pipe(
    startWith(this.initialState),
    // shareReplay(1),
    switchMap((bannerState: boolean) => {
      if (bannerState) {
        return this.inDateRange$;
      } else {
        return of(false);
      }
    })
  );
  // this.displayBanner$.asObservable() as Observable<boolean>;

  closeBanner() {
    this.bannerCloseEvent$.next(false);
  }
}
