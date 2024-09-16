import { Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Badge } from 'src/app/models/badge.model'
import { AngularSvgIconModule } from 'angular-svg-icon'
import { Term } from 'src/app/models/term.model'
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { OverlayModule } from '@angular/cdk/overlay'
@Component({
    standalone: true,
    selector: 'badge-card',
    imports: [CommonModule, AngularSvgIconModule, OverlayModule],
    templateUrl: './badge-card.component.html',
    styleUrls: []
})
export class BadgeCardComponent implements OnInit {


    ngOnInit(): void {
        this.termNames$ = this.terms$.asObservable().pipe(
            map((terms: Term[]) => {
                return this.terms.filter((term: Term) => this.badge.list_terms.includes(term.activity_term))
            }),
            map((terms: Term[]) => {
                return this.terms.map((term: Term) => term.activity_name)
            })
        )
    }

    terms$: BehaviorSubject<Term[]> = new BehaviorSubject([]);
    termNames$: Observable<string[]>;

    @Input()
    enableShadow = true;

    @Input()
    badge: Badge

    @Input()
    public get terms() {
        return this.terms$.getValue();
    }
    public set terms(value) {
        if(!!value && value instanceof Array && value.length > 0){
            this.terms$.next(value);
        }
    }
    private overlayState$ = new BehaviorSubject<boolean>(false);

    overlayOpen$: Observable<boolean> = this.overlayState$.asObservable();
    closeTimeoutSubscription: Subscription | undefined;
  
    setOverlayState(state: boolean, timeout = 100) {
      if (!state) {
        this.closeTimeoutSubscription = timer(timeout)
          .pipe(tap(() => this.overlayState$.next(state)))
          .subscribe();
        return;
      }
      if (this.closeTimeoutSubscription) {
        this.closeTimeoutSubscription.unsubscribe();
      }
      this.overlayState$.next(state);
    }
    


}