import { Serializable } from "src/app/interfaces/deserializable.model";
import { AchievementState } from "../../models/badge.model";

export class AchievementFilter implements Serializable {
  serialize(): any {
    const entries = Object.entries(this);

    let result = {};
    entries.forEach(([attr, value]) => {
      result[attr] = String(value);
    });

    return result;
  }

  static create(filter: any) {
    const achievementFilter = new AchievementFilter();
    Object.assign(achievementFilter, filter);
    return achievementFilter;
  }

  curator_orcid?: string;
  resource_id?: string;
  skip?: number;
  limit?: number;
  name?: string;
  sortBy?: "curator_threshold" | "name";
  sortOrder?: "1" | "-1" | "asc" | "desc";
}

export type BadgeSortable = "achieved_at" | "count_threshold" | "progress_rate";
export class MyBadgesFilter implements Serializable {
  static create(badgeFilter: any) {
    let filter = new MyBadgesFilter();
    for (const k in badgeFilter) {
      if (
        (badgeFilter[k] != null && badgeFilter[k] != undefined) ||
        (badgeFilter[k] instanceof Array && badgeFilter.length > 0)
      ) {
        filter[k] = badgeFilter[k];
      }
    }
    // filter = Object.assign(filter, reportFilter)
    return filter;
  }
  serialize(): any {
    return {
      resource_id: this.resource_id ?? null,
      state: this.state ?? null,
      skip: this.skip ?? null,
      limit: this.limit ?? null,
      sortBy: this.sortBy ?? null,
      sortOrder: this.sortOrder ?? null,
    };
  }

  resource_id?: string;
  state?: AchievementState = "achieved";
  skip?: number = 0;
  limit: number = 4;
  sortBy?: BadgeSortable = "achieved_at";
  sortOrder?: -1 | 1 | "asc" | "desc" = -1;
}
