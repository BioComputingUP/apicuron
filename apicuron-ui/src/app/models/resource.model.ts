import _ from "lodash";
import {
  MonthlyLeaderboardColumns,
  TotalLeaderboardColumns,
  WeeklyLeaderboardColumns,
} from "projects/apicuron-util/src/lib/leaderboard/interfaces/leaderboard-columns.types";
import { LeaderboardOptions } from "projects/apicuron-util/src/lib/leaderboard/interfaces/leaderboard-options";
import {
  Deserializable,
  Serializable,
} from "src/app/interfaces/deserializable.model";
import { ResourceCategory, ResourceCategoryLabels } from "./types/enums";

export class ResourceStats implements Deserializable {
  contributionCount: any;
  uniqueContributors: any;
  lastContributionDate: Date | null;
  firstContributionDate: Date;
  lastResourceUpdateDate: Date | null;

  deserialize(input: any): this {
    this.contributionCount = input.contributionCount;
    this.uniqueContributors = input.uniqueContributors;
    this.lastContributionDate = input.lastContributionDate
      ? new Date(input.lastContributionDate)
      : null;
    this.firstContributionDate = input.firstContributionDate
      ? new Date(input.firstContributionDate)
      : null;
    this.lastResourceUpdateDate = input.lastResourceUpdateDate
      ? new Date(input.lastResourceUpdateDate)
      : null;
    return this;
  }

  hasLastActivity(): boolean {
    return !!this.lastContributionDate || !!this.lastResourceUpdateDate;
  }
}

export class Resource implements Deserializable, Serializable {
  serialize() {
    return {
      resource_id: this.resource_id,
      resource_long_name: this.resource_long_name,
      resource_description: this.resource_description,
      resource_name: this.resource_name,
      resource_uri: this.resource_uri.href,
      resource_url: this.resource_url.href,
      color: this.color,
      category: this.category,
      leaderboard_preferences: {
        monthly: this.leaderboard_preferences.monthly,
        weekly: this.leaderboard_preferences.weekly,
        total: this.leaderboard_preferences.total,
      },
    };
  }
  deserialize(input: any): this {
    this.resource_description = input.resource_description;
    this.resource_id = input.resource_id;
    this.resource_long_name = input.resource_long_name;
    this.resource_name = input.resource_name;
    this.name = input.resource_name;
    this.resource_uri = new URL(input.resource_uri);
    this.resource_url = new URL(input.resource_url);
    this.color = input.color;
    this.joined_date = new Date(input.joined_date);
    this.category = input.category;
    this.leaderboard_preferences = new LeaderboardPreferences().deserialize(
      input.leaderboard_preferences || {},
    );
    if (input.stats) {
      this.stats = new ResourceStats().deserialize(input.stats);
      this.lastSubmissionDate = _.max([
        this.stats.lastContributionDate,
        this.stats.lastResourceUpdateDate,
        this.joined_date,
      ]);
    }

    if (input.logo && typeof input.logo == "string") {
      if (input.logo.startsWith("assets")) {
        this.logo = new URL(input.logo, location.origin + "/");
      } else {
        this.logo = input.logo;
      }
    }

    // this.logo = input.logo;

    this.color = input.color;
    return this;
  }

  faviconLink(): string {
    return new URL("/favicon.ico", this.resource_url).href;
  }

  categoryLabel(): string {
    return ResourceCategoryLabels[this.category];
  }

  compare(other: Resource): boolean {
    return this.resource_id === other.resource_id;
  }

  stats: ResourceStats;
  resource_description: string;
  name: string;
  resource_id: string;
  resource_long_name: string;
  resource_name: string;
  resource_uri: URL;
  resource_url: URL;
  logo: URL;
  color: string;
  joined_date: Date;
  lastSubmissionDate?: Date;
  leaderboard_preferences: LeaderboardPreferences;
  category: ResourceCategory;
}

export class LeaderboardPreferences {
  monthly?: MonthlyLeaderboardColumns[];
  weekly?: WeeklyLeaderboardColumns[];
  total?: TotalLeaderboardColumns[];

  deserialize(input: any): this {
    this.monthly = input.monthly;
    this.weekly = input.weekly;
    this.total = input.total;
    return this;
  }

  parseIntoOptions(): LeaderboardOptions {
    const options: LeaderboardOptions = [];

    if (this.monthly && this.monthly.length > 0) {
      options.push(["monthly-leaderboard", this.monthly]);
    }

    if (this.weekly && this.weekly.length > 0) {
      options.push(["weekly-leaderboard", this.weekly]);
    }

    if (this.total && this.total.length > 0) {
      options.push(["total-leaderboard", this.total]);
    }
    return options;
  }
}
