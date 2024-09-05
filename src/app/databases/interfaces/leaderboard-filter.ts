import { Serializable } from "../../interfaces/deserializable.model";

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
