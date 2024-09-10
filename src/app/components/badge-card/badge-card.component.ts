import {
  Component,
  ElementRef,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AchievementState, Badge } from "src/app/models/badge.model";
import { AngularSvgIconModule } from "angular-svg-icon";
import { NgxPopperModule } from "ngx-popper";
import { Term } from "src/app/models/term.model";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { map } from "rxjs/operators";
@Component({
  standalone: true,
  selector: "badge-card",
  imports: [CommonModule, AngularSvgIconModule, NgxPopperModule],
  templateUrl: "./badge-card.component.html",
  styleUrls: [],
})
export class BadgeCardComponent implements OnInit {
  badge$ = new ReplaySubject<Badge>();
  badgeInProgress$: Observable<boolean>;
  AchievementState = AchievementState;

  ngOnInit(): void {
    this.termNames$ = this.terms$.asObservable().pipe(
      map((terms: Term[]) => {
        return this.terms.filter((term: Term) =>
          this.badge.list_terms.includes(term.activity_term)
        );
      }),
      map((terms: Term[]) => {
        return this.terms.map((term: Term) => term.activity_name);
      })
    );

    this.badgeInProgress$ = this.badge$
      .asObservable()
      .pipe(map((badge: Badge) => badge.state == AchievementState.progress));
  }

  terms$: BehaviorSubject<Term[]> = new BehaviorSubject([]);
  termNames$: Observable<string[]>;

  @Input()
  enableShadow = true;

  @Input() set badge(value: Badge) {
    this.badge$.next(value);
  }

  @Input()
  public get terms() {
    return this.terms$.getValue();
  }
  public set terms(value) {
    if (!!value && value instanceof Array && value.length > 0) {
      this.terms$.next(value);
    }
  }
}
