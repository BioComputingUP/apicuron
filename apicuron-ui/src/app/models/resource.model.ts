import _ from "lodash";
import {
  MonthlyLeaderboardColumns,
  TotalLeaderboardColumns,
  WeeklyLeaderboardColumns,
} from "projects/apicuron-util/src/lib/leaderboard/interfaces/leaderboard-columns.types";
import {
  Deserializable,
  Serializable,
} from "src/app/interfaces/deserializable.model";
import { environment } from "src/environments/environment";
export class ResourceStats implements Deserializable {
  contributionCount: any;
  uniqueContributors: any;
  lastContributionDate: Date | null;
  firstContributionDate: Date;
  lastResourceUpdateDate: Date | null;

  deserialize(input: any): this {
    this.contributionCount = input.contributionCount;
    this.uniqueContributors = input.uniqueContributors;
    this.lastContributionDate = new Date(input.lastContributionDate);
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
      leaderboard_preferences: this.leaderboard_preferences,
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
    this.leaderboard_preferences = input.leaderboard_preferences;
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
        this.logo = new URL(input.logo, environment.host + "/");
      } else {
        this.logo = new URL(input.logo, environment.ws);
      }
    }

    // this.logo = input.logo;

    this.color = input.color;
    return this;
  }

  faviconLink(): string {
    return new URL("/favicon.ico", this.resource_url).href;
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
}

export interface LeaderboardPreferences {
  monthly?: MonthlyLeaderboardColumns[];
  weekly?: WeeklyLeaderboardColumns[];
  total?: TotalLeaderboardColumns[];
}
