import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { Observable, combineLatest, of } from "rxjs";
import { catchError, map, shareReplay } from "rxjs/operators";
import { AchievementsModule } from "src/app/achievements/achievements.module";
import { AchievementFilter } from "src/app/achievements/interfaces/achievement-filter";
import { BadgesService } from "src/app/achievements/services/badges.service";
import { MedalsService } from "src/app/achievements/services/medals.service";
import { AchievementListComponent } from "src/app/components/achievement-list/achievement-list.component";
import {
  ActivityBar,
  ActivityBarsComponent,
  toActivityBars,
} from "src/app/components/activity-bars/activity-bars.component";
import {
  ContributionListComponent,
  ContributionRow,
  toContributionRow,
} from "src/app/components/contribution-list/contribution-list.component";
import { CuratorBadgesDetailsComponent } from "src/app/components/curator-badges-details/curator-badges-details.component";
import { CuratorMedalsDetailsComponent } from "src/app/components/curator-medals-details/curator-medals-details.component";
import { SectionHeaderComponent } from "src/app/components/section-header/section-header.component";
import { CuratorStatisticsModule } from "src/app/curator-statistics/curator-statistics.module";
import { CuratorStatisticsService } from "src/app/curator-statistics/services/curator-statistics.service";
import { Paginated } from "src/app/interfaces/paginated";
import { Badge } from "src/app/models/badge.model";
import { Medal } from "src/app/models/medal.model";
import { Report } from "src/app/models/report.model";
import { Resource } from "src/app/models/resource.model";
import { CuratorStatistics } from "src/app/models/statistics.model";
import { Term } from "src/app/models/term.model";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { ReportsModule } from "src/app/reports/reports.module";
import { ReportsService } from "src/app/reports/services/reports.service";
import { TermsModule } from "src/app/terms/terms.module";
import { TermsService } from "src/app/terms/services/terms.service";
import { User } from "../../models/User.model";
import { ResourcesService } from "../../resource/service/resources.service";
import { CuratorReportsDetailsComponent } from "../curator-reports-details/curator-reports-details.component";
import { SlideOverPanelComponent } from "../utils/slide-over-panel/slide-over-panel.component";

const LATEST_CONTRIBUTIONS = 5;
const ACHIEVEMENTS_PREVIEW = 6;

/**
 * A person's contributions to one resource on the profile page:
 * header with the headline figures, contributions by activity next to
 * achievements, then the latest contributions.
 */
@Component({
  selector: "curator-stat-card",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReportsModule,
    TermsModule,
    AchievementsModule,
    CuratorStatisticsModule,
    SectionHeaderComponent,
    ActivityBarsComponent,
    AchievementListComponent,
    ContributionListComponent,
    SlideOverPanelComponent,
    CuratorReportsDetailsComponent,
    CuratorMedalsDetailsComponent,
    CuratorBadgesDetailsComponent,
  ],
  templateUrl: "./curator-stat-card.component.html",
  styleUrls: ["./curator-stat-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuratorStatCardComponent implements OnInit {
  @Input() statistics: CuratorStatistics;
  @Input() curator: User;
  /** when the page already loaded the resource, the card does not fetch it again */
  @Input() resource?: Resource;

  resource$: Observable<Resource>;
  terms$: Observable<Term[]>;
  activityBars$: Observable<ActivityBar[]>;
  contributions$: Observable<ContributionRow[]>;
  medals$: Observable<Medal[]>;
  badges$: Observable<Badge[]>;

  /** dates of this person's first and latest contribution to the resource */
  firstContribution: Date | null = null;
  latestContribution: Date | null = null;
  /** set when the resource logo fails to load, to fall back to the colour dot */
  logoFailed = false;

  open_details = false;
  open_badge_details = false;
  open_medal_details = false;

  constructor(
    protected reportsService: ReportsService,
    protected resourceService: ResourcesService,
    protected termService: TermsService,
    protected statisticsService: CuratorStatisticsService,
    protected medalService: MedalsService,
    protected badgeService: BadgesService
  ) {}

  ngOnInit(): void {
    const { resource_id } = this.statistics;
    const orcid_id = this.curator.orcid_id;

    this.firstContribution = validDate(this.statistics.first_contribution);
    this.latestContribution = validDate(this.statistics.last_contribution);

    this.resource$ = this.resource
      ? of(this.resource)
      : this.resourceService.get_resource(resource_id).pipe(shareReplay(1));

    this.terms$ = this.termService
      .getTerms({ resource_id })
      .pipe(shareReplay(1));

    // per-activity counts of this card's statistics (same league), when available
    this.activityBars$ = this.statisticsService
      .getDetailedStatistics(resource_id, orcid_id)
      .pipe(
        map((details) => {
          const detail =
            details.find((d) => d.league === this.statistics.league) ??
            details[0];
          return detail ? toActivityBars(detail.activities) : [];
        }),
        catchError(() => of([])),
        shareReplay(1)
      );

    const reportFilter = ReportFilter.create({
      resource_id,
      curator_orcid: orcid_id,
      sortBy: "timestamp",
      sortOrder: -1,
      limit: LATEST_CONTRIBUTIONS,
    });
    this.contributions$ = combineLatest([
      this.terms$,
      this.reportsService.getReports(reportFilter),
    ]).pipe(
      map(([terms, reports]: [Term[], Paginated<Report>]) =>
        reports.data.map((report) => toContributionRow(report, terms))
      ),
      catchError(() => of([]))
    );

    const achievementFilter = AchievementFilter.create({
      curator_orcid: orcid_id,
      resource_id,
      limit: ACHIEVEMENTS_PREVIEW,
    });
    this.medals$ = this.medalService.getMedals(achievementFilter).pipe(
      map((medals) => medals.data),
      catchError(() => of([]))
    );
    this.badges$ = this.badgeService.getBadges(achievementFilter).pipe(
      map((badges) => badges.data.filter((badge) => badge.state === "achieved")),
      catchError(() => of([]))
    );
  }
  /** long name (when it adds something) and category, e.g. "Intrinsically Disordered Protein Ontology · Software" */
  subtitle(resource: Resource): string {
    const longName =
      resource.resource_long_name !== resource.resource_name
        ? resource.resource_long_name
        : "";
    return [longName, resource.categoryLabel()].filter(Boolean).join(" · ");
  }
}

function validDate(value: Date | string | number | undefined): Date | null {
  const date = value ? new Date(value) : null;
  return date && !isNaN(date.getTime()) ? date : null;
}
