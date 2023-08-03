import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map, pluck } from "rxjs/operators";
import { DatabasesService } from "../../databases/services/databases.service";
import { environment } from "../../../environments/environment";
import * as _ from "lodash";
import { User } from "../../models/User.model";
import {
  BaseCuratorStatistics,
  CuratorStatistics,
} from "../../models/statistics.model";
type StatData = {
  resource_id: string;
  generation_score;
  revision_score;
  invalidation_score;
};

@Component({
  selector: "curator-card",
  templateUrl: "./curator-card.component.html",
  styleUrls: ["./curator-card.component.scss"],
})
export class CuratorCardComponent implements OnInit {
  resources$: Observable<any>;

  constructor(protected databaseService: DatabasesService) {
    this.resources$ = this.databaseService.get_resources().pipe(
      pluck("data"),
      map((resources: Array<any>) => {
        let result = {};
        resources.map(({ resource_id, resource_name }) => {
          result[resource_id] = resource_name;
        });
        return result;
      })
    );
  }

  @Input()
  vertical = true;

  @Input() biocurator: User;
  @Input() stats: BaseCuratorStatistics[];

  @Input()
  display_scores = true;

  @Input()
  display_achievement_counts = false;

  @Input()
  display_resources = true;

  single_resource() {
    return !Array.isArray(this.stats) || this.stats.length == 1;
  }

  // @Input() full_name: "Bouhraoua Kamel Eddine Adel";
  // @Input() resources: ["disprot", "ped"];

  get displayedName() {
    return this.biocurator.displayedName;
  }

  get resources() {
    return this.stats.map((x) => x.resource_id);
  }

  get badge_count() {
    return this.stats.reduce(
      (acc, curr: CuratorStatistics) => acc + curr.badges_count,
      0
    );
  }

  get medal_count() {
    return this.stats.reduce(
      (acc, curr: CuratorStatistics) => acc + curr.medals_count,
      0
    );
  }

  get generation_score() {
    const scores = this.stats.map((resource) => resource.generation_score);
    return scores.reduce((a, b) => a + b, 0);
  }
  get revision_score() {
    const scores = this.stats.map((resource) => resource.revision_score);
    return scores.reduce((a, b) => a + b, 0);
  }

  get invalidation_score() {
    const scores = this.stats.map((resource) => resource.invalidation_score);
    return scores.reduce((a, b) => a + b, 0);
  }

  get orcid_id() {
    return this.biocurator.orcid_id;
  }

  ngOnInit(): void {}
}
