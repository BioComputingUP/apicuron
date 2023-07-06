import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { Resource } from "src/app/models/resource.model";
import { CuratorStatistics } from "src/app/models/statistics.model";
import { RewardCardComponent } from "./reward-card.component";
import { User } from "../../models/User.model";
import { ReportsModule } from "src/app/reports/reports.module";
import { ReportsService } from "src/app/reports/services/reports.service";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { Observable, combineLatest } from "rxjs";
import { map, shareReplay, tap } from "rxjs/operators";
import { ReportCardComponent } from "src/app/components/report-card/report-card.component";
import { TermsService } from "src/app/terms/services/terms.service";
import { Term } from "src/app/models/term.model";
import { Report } from "src/app/models/report.model";
import { TermsModule } from "src/app/terms/terms.module";
import { CuratorStatDetailsComponent } from "../curator-reports-details/curator-reports-details.component";
import { SlideOverPanelComponent } from "../utils/slide-over-panel/slide-over-panel.component";
import { FormBuilder } from "@angular/forms";
import { Medal } from '../../models/medal.model'
import { MedalCardComponent } from "src/app/components/medal-card/medal-card.component";
import { AchievementsModule } from "src/app/achievements/achievements.module";
import { MedalsService } from "src/app/achievements/services/medals.service";
import { AchievementFilter } from "src/app/achievements/interfaces/achievement-filter";
import { BadgeCardComponent } from "src/app/components/badge-card/badge-card.component";
import { BadgesService } from "src/app/achievements/services/badges.service";
import { Badge } from "src/app/models/badge.model";
import { CuratorMedalsDetailsComponent } from "src/app/components/curator-medals-details/curator-medals-details.component";
import { Paginated } from "src/app/interfaces/paginated";
import { CuratorBadgesDetailsComponent } from "src/app/components/curator-badges-details/curator-badges-details.component";
@Component({
  selector: "curator-stat-card",
  standalone: true,
  imports: [
    CommonModule,
    RewardCardComponent,
    ReportsModule,
    ReportCardComponent,
    TermsModule,
    CuratorStatDetailsComponent,
    SlideOverPanelComponent,
    MedalCardComponent,
    AchievementsModule,
    BadgeCardComponent,
    CuratorMedalsDetailsComponent,
    CuratorBadgesDetailsComponent
  ],
  templateUrl: "./curator-stat-card.component.html",
  styleUrls: ["./curator-stat-card.component.scss"],
})
export class CuratorStatCardComponent implements OnInit {
  terms$: Observable<Object>;
  reportsWithTerms$: Observable<{ report: Report; term: Term }[]>;
  detailForm: any;
  badges$: Observable<Paginated<Badge>>;

  constructor(
    protected reportsService: ReportsService,
    protected termService: TermsService,
    protected formBuilder: FormBuilder,
    protected medalService: MedalsService,
    protected badgeService: BadgesService
  ) {}

  reports$: Observable<Paginated<Report>>;

  open_details: Boolean = false;
  open_badge_details: Boolean = false;
  open_medal_details: Boolean = false;
  medals$: Observable<Paginated<Medal>>;
  

  ngOnInit(): void {
    // load initial reports
    const reportFilter = ReportFilter.create({
      resource_id: this.resource.resource_id,
      curator_orcid: this.curator.orcid_id,
      sortBy: "timestamp",
      sortOrder: 1,
      limit: 4,
    });
    this.reports$ = this.reportsService
      .getReports(reportFilter)
      .pipe(shareReplay());

    this.terms$ = this.termService
      .getTerms({ resource_id: this.resource.resource_id })
      .pipe(shareReplay());

    this.reportsWithTerms$ = combineLatest([this.terms$, this.reports$]).pipe(
      map(([terms, reports]: [Term[], Paginated<Report>]) => {
        return reports.data.map((report: Report) => {
          return {
            report: report,
            term: terms.find(
              (term) => term.activity_term == report.activity_term
            ),
          };
        });
      }),
    );
    const filter = AchievementFilter.create({
      curator_orcid: this.curator.orcid_id,
      resource_id: this.resource.resource_id,
      limit: 4
    })
    this.medals$ = this.medalService.getMedals(filter)

    this.badges$ = this.badgeService.getBadges(filter)
  }

  @Input() statistics: CuratorStatistics;
  @Input() resource: Resource;
  @Input() curator: User;

  get curatorStats(): CuratorStatistics {
    return this.statistics;
  }

  get phrasing() {
    return this.statistics.work_type == "contribution"
      ? "contributed to"
      : "professionally worked at";
  }

  get rewards() {
    const stat = this.statistics;
    const contribution_stats = [
      {
        icon_src: "assets/badge_icon.svg",
        color: this.resource.color,
        value_text: stat.badges_count,
        label_text: "Earned Badges",
      },
      {
        icon_src: "assets/medal_icon.svg",
        color: this.resource.color,
        value_text: stat.medals_count,
        label_text: "Earned Medals",
      },
      {
        icon_src: "assets/svg/create_icon.svg",
        color: this.resource.color,
        value_text: stat.generation_count,
        label_text: "Generation Events",
      },
      {
        icon_src: "assets/svg/pencil.svg",
        color: this.resource.color,
        value_text: stat.revision_count,
        label_text: "Revision Events",
      },
      {
        icon_src: "assets/svg/invalidation_icon.svg",
        color: this.resource.color,
        value_text: stat.invalidation_count,
        label_text: "Invalidation Events",
      }
    ];
    return contribution_stats;
  }
}
