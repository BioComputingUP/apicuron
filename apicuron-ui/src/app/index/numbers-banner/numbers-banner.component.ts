import { HttpClient } from "@angular/common/http";
import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Resource } from "../../models/resource.model";
import { ResourceCategory } from "../../models/types/enums";
import { environment } from "../../../environments/environment";

interface HomeCounts {
  user_count: number;
  resource_count: number;
  report_count: number;
  achievement_count: number;
}

interface NumberElement {
  icon: string;
  count: number;
  text: string;
}

interface CategoryCount {
  label: string;
  count: number;
}

@Component({
  selector: "index-numbers-banner",
  templateUrl: "./numbers-banner.component.html",
  styleUrls: ["./numbers-banner.component.scss"],
})
export class NumbersBannerComponent {
  /** the partner resources listed on the page, for the per-category breakdown */
  @Input() resources: Resource[] | null = null;

  numberElements$: Observable<NumberElement[]>;

  constructor(private httpClient: HttpClient) {
    this.numberElements$ = this.httpClient
      .get<HomeCounts>(environment.ws + "/home")
      .pipe(
        map((counts) => [
          {
            icon: "assets/user.svg",
            count: counts.user_count,
            text: "Registered Contributors",
          },
          {
            icon: "assets/database.svg",
            count: counts.resource_count,
            text: "Partner Resources",
          },
          {
            icon: "assets/curation-events.svg",
            count: counts.report_count,
            text: "Contribution Events",
          },
          {
            icon: "assets/medal_icon.svg",
            count: counts.achievement_count,
            text: "Achievements",
          },
        ])
      );
  }

  /** resources per output type, Data being Database + Knowledge Base; empty types are left out */
  get categoryCounts(): CategoryCount[] {
    const resources = this.resources ?? [];
    const count = (...categories: ResourceCategory[]) =>
      resources.filter((r) => categories.includes(r.category)).length;
    return [
      {
        label: "Data",
        count: count(ResourceCategory.Database, ResourceCategory.KnowledgeBase),
      },
      { label: "Software", count: count(ResourceCategory.Software) },
      { label: "Training", count: count(ResourceCategory.Training) },
    ].filter((c) => c.count > 0);
  }
}
