import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map, pluck } from "rxjs/operators";
import { DatabasesService } from "../../databases/services/databases.service";
import { environment } from "../../../environments/environment";

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
      pluck('data'),
      map((resources: Array<any>) => {
        let result = {};
        resources.map(
          ({resource_id, resource_name}) => {
            result[resource_id] = resource_name
          }
        )
        return result;
      })
    )
  }

  @Input()
  vertical = true;

  @Input() biocurator: {
    displayedName: string;
    stats: Array<StatData>;
    orcid_id: string;
  } = null;

  @Input()
  display_scores = true;

  @Input()
  display_resources = true;

  single_resource() {
    return !Array.isArray(this.biocurator["stats"]);
  }

  // @Input() full_name: "Bouhraoua Kamel Eddine Adel";
  // @Input() resources: ["disprot", "ped"];

  get displayedName() {
    return this.biocurator.displayedName;
  }

  get resources() {
    return this.biocurator.stats.map((x) => x.resource_id);
  }

  get generation_score() {
    const scores = this.biocurator.stats.map(
      (resource) => resource.generation_score
    );
    return scores.reduce((a, b) => a + b, 0);
  }
  get revision_score() {
    const scores = this.biocurator.stats.map(
      (resource) => resource.revision_score
    );
    return scores.reduce((a, b) => a + b, 0);
  }

  get invalidation_score() {
    const scores = this.biocurator.stats.map(
      (resource) => resource.invalidation_score
    );
    return scores.reduce((a, b) => a + b, 0);
  }

  get orcid_id() {
    return this.biocurator.orcid_id;
  }

  orcid_link(orcid_id: string){
    return new URL(orcid_id, environment.orcid_main_url).href
  }

  generate_avatar(){
    const emailHash = encodeURIComponent(this.displayedName);
    const defaultImage = encodeURIComponent(`https://api.dicebear.com/5.x/identicon/png/seed=${emailHash}&scale=75&radius=50`);
    return `https://www.gravatar.com/avatar/${emailHash}?d=${defaultImage}`;
  }
  ngOnInit(): void {}
}
