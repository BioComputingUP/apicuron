import {
  Deserializable,
  Serializable,
} from "../../../../../../../src/app/interfaces/deserializable.model";
import { User } from "../../../../../../../src/app/models/User.model";
import { PrivacyType } from "../../../../../../../src/app/util/privacy.helper";
export class LeaderboardFilter implements Serializable {
  constructor(resource_id: string, skip: number, limit: number) {
    this.resource_id = resource_id;
    this.skip = skip;
    this.limit = limit;
  }
  serialize(): any {
    return {
      resource_id: this.resource_id,
      skip: this.skip,
      limit: this.limit,
    };
  }

  resource_id: string;
  skip: number;
  limit: number;
}

export class MonthlyCuratorStatistics implements Deserializable {
  deserialize(input: any): this {
    this.curator_orcid = input.curator_orcid;
    this.resource_id = input.resource_id;
    this.generation_count = input.generation_count;
    this.generation_score = input.generation_score;
    this.invalidation_count = input.invalidation_count;
    this.invalidation_score = input.invalidation_score;
    this.revision_count = input.revision_count;
    this.revision_score = input.revision_score;
    this.total_count = input.total_count;
    this.total_score = input.total_score;
    this.first_contribution = input.first_contribution;
    this.last_contribution = input.last_contribution;
    this.monthStart = input.monthStart;
    this.monthEnd = input.monthEnd;
    return this;
  }
  resource_id: string;
  privacy: PrivacyType;
  league: string;
  curator_orcid: string;
  generation_count: number;
  generation_score: number;
  invalidation_count: number;
  invalidation_score: number;
  resource_uri?: string;
  revision_count: number;
  revision_score: number;
  total_count: number;
  total_score: number;
  last_contribution: Date;
  first_contribution: Date;
  createdAt: Date;
  updatedAt: Date;
  monthStart: Date;
  monthEnd: Date;
}

export class MonthlyLeaderboardEntry implements Deserializable {
  user: User;
  stat: MonthlyCuratorStatistics;
  deserialize(input: any): this {
    const stat = new MonthlyCuratorStatistics().deserialize(input.stat);
    const user = new User().deserialize(input.user);

    this.stat = stat;
    this.user = user;
    return this;
  }
}
