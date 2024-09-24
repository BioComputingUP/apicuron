import { Deserializable } from "../../interfaces/deserializable.model";
import { User } from "../../models/User.model";
import {
  BaseCuratorStatistics,
  WeeklyCuratorStatistics,
} from "../../models/statistics.model";
import { PrivacyType } from "../../util/privacy.helper";
export class CuratorWithStats extends User implements Deserializable {
  stats: BaseCuratorStatistics[];

  deserialize(input: any): this {
    super.deserialize(input);
    this.stats = input?.stats ?? [];

    return this;
  }
}

export class CuratorWithWeeklyStats extends User implements Deserializable {
  stats: WeeklyCuratorStatistics[];

  deserialize(input: any): this {
    super.deserialize(input);
    this.stats = input?.stats ?? [];

    return this;
  }
}

export class ActivitiesStatistics implements Deserializable {
  deserialize(input: any): this {
    this.activity_category = input.activity_category;
    this.activity_name = input.activity_name;
    this.activity_term = input.activity_term;
    this.count = parseInt(input.count);
    this.description = input.description;
    this.score = parseInt(input.score);
    this.total_score = parseInt(input.score);
    this.last_contribution = new Date(input.last_contribution);
    this.first_contribution = new Date(input.first_contribution);
    this.last_week_count = parseInt(input.last_week_count);
    this.last_month_count = parseInt(input.last_month_count);
    this.last_quarter_count = parseInt(input.last_quarter_count);
    return this;
  }
  activity_category: string;
  activity_name: string;
  activity_term: string;
  count: number;
  description: string;
  score: number;
  total_score: number;
  last_contribution: Date;
  first_contribution: Date;
  last_week_count: number;
  last_month_count: number;
  last_quarter_count: number;
}
export class DetailedStatistics implements Deserializable {
  deserialize(input: any): this {
    this.curator_orcid = input.curator_orcid;
    this.resource_id = input.resource_id;
    this.privacy = input.privacy;
    this.league = input.league;
    this.total_count = parseInt(input.total_count);
    this.total_score = parseInt(input.total_score);
    this.last_contribution = new Date(input.last_contribution);
    this.first_contribution = new Date(input.first_contribution);
    this.last_week_count = parseInt(input.last_week_count);
    this.last_month_count = parseInt(input.last_month_count);
    this.last_quarter_count = parseInt(input.last_quarter_count);
    this.activities = input.activities.map((activity) =>
      new ActivitiesStatistics().deserialize(activity)
    );
    return this;
  }

  curator_orcid: string;
  resource_id: string;
  privacy: PrivacyType;
  league: string;
  total_count: number;
  total_score: number;
  last_contribution: Date;
  first_contribution: Date;
  last_week_count: number;
  last_month_count: number;
  last_quarter_count: number;
  activities: ActivitiesStatistics[];
}
