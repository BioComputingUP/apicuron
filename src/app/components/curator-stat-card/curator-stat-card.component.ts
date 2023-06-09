import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { StatisticsWithResource } from "src/app/curator/curator-page/curator-page.service";
import { Resource } from "src/app/models/resource.model";
import { CuratorStatistics } from "src/app/models/statistics.model";
import { RewardCardComponent } from "./reward-card.component";
import { User } from "../../models/User";
@Component({
  selector: "curator-stat-card",
  standalone: true,
  imports: [CommonModule, RewardCardComponent],
  templateUrl: "./curator-stat-card.component.html",
  styleUrls: ["./curator-stat-card.component.scss"],
})
export class CuratorStatCardComponent implements OnInit {
  constructor() {}

  
  ngOnInit(): void {
    // throw new Error("Method not implemented.");
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

    ];
    return contribution_stats.filter((s) => s.value_text > 0);
  }
}
