import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { Resource } from "src/app/models/resource.model";
import { CuratorStatistics } from "src/app/models/statistics.model";
import { RewardCardComponent } from "./reward-card.component";
import { User } from "../../models/User";
import { ReportsModule } from "src/app/reports/reports.module";
import { ReportsService } from "src/app/reports/services/reports.service";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { Observable, combineLatest } from "rxjs";
import { PaginatedReports } from "src/app/reports/interfaces/paginated-reports.interface";
import { map, shareReplay, tap } from "rxjs/operators";
import { ReportCardComponent } from "src/app/components/report-card/report-card.component";
import { TermsService } from "src/app/terms/services/terms.service";
import { Term } from "src/app/models/term.model";
import { Report } from "src/app/models/report.model";
import { TermsModule } from "src/app/terms/terms.module";
import { CuratorStatDetailsComponent } from "../curator-stat-details/curator-stat-details.component";
import { SlideOverPanelComponent } from "../utils/slide-over-panel/slide-over-panel.component";
import { FormBuilder } from "@angular/forms";
import { MultipleSelectComponent } from "../utils/multiple-select/mutliple-select.component";
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
    MultipleSelectComponent,
  ],
  templateUrl: "./curator-stat-card.component.html",
  styleUrls: ["./curator-stat-card.component.scss"],
})
export class CuratorStatCardComponent implements OnInit {
  terms$: Observable<Object>;
  reportsWithTerms$: Observable<{ report: Report; term: Term }[]>;
  detailForm: any;

  constructor(
    protected reportsService: ReportsService,
    protected termService: TermsService,
    protected formBuilder: FormBuilder
  ) {}

  reports$: Observable<PaginatedReports>;

  open_details: Boolean = true;

  

  ngOnInit(): void {
    // load initial reports
    const reportFilter = ReportFilter.create({
      resource_id: this.resource.resource_id,
      curator_orcid: this.curator.orcid_id,
      sortBy: "timestamp",
      sortOrder: "asc",
      page_size: 9,
    });
    this.reports$ = this.reportsService
      .getReports(reportFilter)
      .pipe(shareReplay());

    this.terms$ = this.termService
      .getTerms({ resource_id: this.resource.resource_id })
      .pipe(shareReplay());

    this.reportsWithTerms$ = combineLatest([this.terms$, this.reports$]).pipe(
      map(([terms, reports]: [Term[], PaginatedReports]) => {
        return reports.data.map((report: Report) => {
          return {
            report: report,
            term: terms.find(
              (term) => term.activity_term == report.activity_term
            ),
          };
        });
      })
    );

    // this.detailForm = this.formBuilder.group({
    //   resource_id: [this.resource.resource_id],
    //   curator_orcid: [this.curator.orcid_id],
    //   sortBy
    // })
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
      },
      {
        icon_src: "assets/svg/score.svg",
        color: this.resource.color,
        value_text: stat.total_score,
        label_text: "Total Score",
      },
    ];
    // return contribution_stats.filter((s) => s.value_text > 0);
    return contribution_stats;
  }
}
