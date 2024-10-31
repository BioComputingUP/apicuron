import { Deserializable, Serializable } from "../../../../../../../src/app/interfaces/deserializable.model";
import { BaseCuratorStatistics } from "../../../../../../../src/app/models/statistics.model";
import { User } from "../../../../../../../src/app/models/User.model";


export class LeaderboardEntry implements Deserializable {
  user: User | null;
  stat: BaseCuratorStatistics;
  constructor() { }
  deserialize(input: any): this {
    const stat = new BaseCuratorStatistics().deserialize(input.stat);
    const user = !!input.user ? new User().deserialize(input.user) : null;

    this.stat = stat;
    this.user = user;
    return this;
  }
}
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

