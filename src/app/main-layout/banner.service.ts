import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";


@Injectable()
export class BannerService {

    private displayBanner$ = new BehaviorSubject<boolean>(true);

    public displayBanner = this.displayBanner$.asObservable() as Observable<boolean>;

    closeBanner(){
        this.displayBanner$.next(false);
    }
}