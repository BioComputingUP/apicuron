import { Deserializable } from "../../interfaces/deserializable.model";
import {
  BaseCuratorStatistics,
  WeeklyCuratorStatistics,
} from "../../models/statistics.model";
import { User } from "../../models/User.model";

export class LeaderboardEntry implements Deserializable {
  user: User;
  stat: BaseCuratorStatistics;
  deserialize(input: any): this {
    const stat = new BaseCuratorStatistics().deserialize(input.stat);
    const user = new User().deserialize(input.user);

    this.stat = stat;
    this.user = user;
    return this;
  }
}

export class WeeklyLeaderboardEntry implements Deserializable {
  user: User;
  stat: WeeklyCuratorStatistics;
  deserialize(input: any): this {
    const stat = new WeeklyCuratorStatistics().deserialize(input.stat);
    const user = new User().deserialize(input.user);

    this.stat = stat;
    this.user = user;
    return this;
  }
}
