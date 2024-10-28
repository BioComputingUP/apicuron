import {
  Deserializable,
  Serializable,
} from "../../../../../../../src/app/interfaces/deserializable.model";
import { WeeklyCuratorStatistics } from "../../../../../../../src/app/models/statistics.model";
import { User } from "../../../../../../../src/app/models/User.model";
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

export class WeeklyLeaderboardEntry implements Deserializable {
  user: User | null;
  stat: WeeklyCuratorStatistics;
  deserialize(input: any): this {
    const stat = new WeeklyCuratorStatistics().deserialize(input.stat);
    const user = !!input.user ? new User().deserialize(input.user) : null;

    this.stat = stat;
    this.user = user;
    return this;
  }
}
