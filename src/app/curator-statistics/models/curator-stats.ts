import { Deserializable } from "../../interfaces/deserializable.model";
import { User } from "../../models/User.model";
import { BaseCuratorStatistics, WeeklyCuratorStatistics } from "../../models/statistics.model";
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