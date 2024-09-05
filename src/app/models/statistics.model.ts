import { Deserializable } from "src/app/interfaces/deserializable.model";
import { Term } from "src/app/models/term.model";

export type StatisticsTerm = Term & {
  count: number;
};

export class BaseCuratorStatistics implements Deserializable {
  curator_orcid: string;

  resource_uri: string;
  resource_id: string;

  generation_count: number;
  generation_score: number;
  invalidation_count: number;
  invalidation_score: number;
  revision_count: number;
  revision_score: number;

  ranking: number;
  medals_count: number;
  badges_count: number;
  total_score: number;

  first_contribution: number;
  last_contribution: number;

  work_type: "contribution" | "professional" = "contribution";
  total_count: any;

  deserialize(input: any): this {
    // curator
    this.curator_orcid = input.curator_orcid;
    // resource
    this.resource_uri = input.resource_uri;
    this.resource_id = input.resource_id;
    // achievements
    this.badges_count = input.badges_count;
    this.medals_count = input.medals_count;
    // metrics
    this.generation_count = input.generation_count;
    this.generation_score = input.generation_score;

    this.invalidation_count = input.invalidation_count;
    this.invalidation_score = input.invalidation_score;

    this.revision_count = input.revision_count;
    this.revision_score = input.revision_score;

    this.ranking = input.ranking;

    this.first_contribution = input.first_contribution;
    this.last_contribution = input.last_contribution;

    this.total_count =
      input.total_count ||
      input.revision_count + input.generation_count + input.invalidation_count;

    this.total_score = input.total_score;
    return this;
  }
}
export class CuratorStatistics extends BaseCuratorStatistics {
  curator_orcid: string;

  resource_uri: string;
  resource_id: string;

  generation_count: number;
  generation_score: number;
  invalidation_count: number;
  invalidation_score: number;
  revision_count: number;
  revision_score: number;

  ranking: number;
  medals_count: number;
  badges_count: number;
  total_score: number;

  revision_terms: StatisticsTerm[];
  invalidation_terms: StatisticsTerm[];
  generation_terms: StatisticsTerm[];

  work_type: "contribution" | "professional" = "contribution";
  total_count: any;

  deserialize(input: any): this {
    super.deserialize(input);
    this.generation_terms = input.generation_terms || null;

    this.invalidation_terms = input.invalidation_terms || null;

    this.revision_terms = input.revision_terms || null;

    return this;
  }
}

export class WeeklyCuratorStatistics implements Deserializable {
  curator_orcid: string;
  resource_id: string;
  generation_count: number;
  generation_score: number;
  invalidation_count: number;
  invalidation_score: number;
  revision_count: number;
  revision_score: number;
  ranking: number;
  total_count: number;
  total_score: number;
  daysOfWeek: Array< { day: number; count: number } >;
  first_contribution: number;
  last_contribution: number;

  deserialize(input: any): this {
    this.curator_orcid = input.curator_orcid;
    this.resource_id = input.resource_id;
    this.generation_count = input.generation_count;
    this.generation_score = input.generation_score;
    this.invalidation_count = input.invalidation_count;
    this.invalidation_score = input.invalidation_score;
    this.revision_count = input.revision_count;
    this.revision_score = input.revision_score;
    this.ranking = input.ranking;
    this.total_count = input.total_count;
    this.total_score = input.total_score;
    this.daysOfWeek = this.processDaysOfWeek(input.daysOfWeek);
    this.first_contribution = input.first_contribution;
    this.last_contribution = input.last_contribution;
    return this;
  }

  private processDaysOfWeek(daysOfWeek: number[]): Array<{ day: number; count: number }> {
    return daysOfWeek.map((count, index) => ({
      day: index,
      count: count
    }));
  }
}