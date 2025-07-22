import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { filter, map, shareReplay, switchMap } from "rxjs/operators";
import { MyBadgesFilter } from "src/app/achievements/interfaces/achievement-filter";
import { BadgesService } from "src/app/achievements/services/badges.service";
import { BadgeCardComponent } from "src/app/components/badge-card/badge-card.component";
import { Paginated } from "src/app/interfaces/paginated";
import { User } from "src/app/models/User.model";
import { Badge } from "src/app/models/badge.model";
import { Resource } from "src/app/models/resource.model";
import { PaginationComponent } from "src/app/pagination/pagination.component";
import { TermsModule } from "../../terms/terms.module";
import { TermsService } from "../../terms/services/terms.service";
import { TermsFilter } from "../../terms/models/terms-filter";
import { Term } from "../../models/term.model";
import { AchievementsModule } from "../../achievements/achievements.module";

@Component({
  standalone: true,
  selector: "my-badges-details",
  imports: [
    CommonModule,
    TermsModule,
    BadgeCardComponent,
    PaginationComponent,
    AchievementsModule,
  ],
  templateUrl: "./my-badges-details.component.html",
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyBadgesDetailsComponent implements OnInit {
  @Input() curator: User;

  @Input() set filter(value: MyBadgesFilter) {
    this.badgeFilter$.next(value);
  }
  @Input() terms: Term[];

  badges$: Observable<Paginated<Badge>>;
  terms$: Observable<Term[]>;
  get currentPage() {
    const val = this.badgeFilter$.value;
    return val.skip / val.limit + 1;
  }

  set currentPage(value) {
    this.update_page(value);
  }

  update_page(page) {
    const filter = this.badgeFilter$.value;
    filter.skip = (page - 1) * filter.limit;
    this.badgeFilter$.next(filter);
  }

  badgeFilter$: BehaviorSubject<MyBadgesFilter> = new BehaviorSubject(null);

  constructor(
    protected badgeService: BadgesService,
    protected termService: TermsService
  ) {}

  loadTerms() {
    if (!!this.terms && this.terms instanceof Array && this.terms.length > 0) {
      return of(this.terms);
    }
  }

  ngOnInit(): void {
    this.badges$ = this.badgeFilter$.pipe(
      // filter((filter) => !!filter),
      switchMap((badgeFilter: MyBadgesFilter) => {
        return this.badgeService.getMyBadges(badgeFilter).pipe(shareReplay(1));
      }),
      shareReplay(1)
    );

    this.terms$ = this.loadTerms();
  }
}
