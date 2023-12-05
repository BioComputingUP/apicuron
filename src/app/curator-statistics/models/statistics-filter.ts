import { HttpParams } from "@angular/common/http";
import {
  Deserializable,
  Serializable,
} from "../../interfaces/deserializable.model";
import { User } from "../../models/User.model";
import { CuratorStatistics } from "../../models/statistics.model";

export enum FilterField {
  displayedName = "displayedName",
  orcid_id = "orcid_id",
}

export class StatisticsFilter implements Serializable {
  serialize(): any {
    const payload: any = {};
    if (!!this.filter_field && !!this.query) {
      payload.filter_field = this.filter_field;
      payload.query = this.query;
    }
    if (!!this.resources && this.resources.length > 0) {
      payload["resources[]"] = this.resources;
    }
    if (this.sortBy && this.sortOrder) {
      payload.sortBy = this.sortBy;
      payload.sortOrder = String(this.sortOrder);
    }
    payload.limit = this.limit;
    payload.skip = this.skip;
    return payload;
  }

  filter_field?: FilterField;

  query: string;

  resources?: string[];

  sortBy:
    | "ranking"
    | "total_score"
    | "medal_count"
    | "badge_count"
    | "generation_count"
    | "invalidation_count"
    | "revision_count"
    | "displayedName";

  sortOrder: 1 | -1;

  skip: number = 0;

  limit: number = 10;
}
