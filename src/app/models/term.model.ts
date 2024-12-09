import * as _ from "lodash";
import {
  Deserializable,
  Serializable,
} from "../interfaces/deserializable.model";
import { Report } from "./report.model";

export type TermCategory = "generation" | "invalidation" | "revision";

export class Term implements Deserializable, Serializable {
  serialize(): any {
    return Object.assign({}, this);
  }
  category: TermCategory;
  activity_term: string;
  resource_uri?: string;
  activity_name: string;
  description: string;
  score: number;
  resource_id: string;

  deserialize(input: any): this {
    this.category = input.activity_category;
    this.activity_term = input.activity_term;
    this.resource_uri = input.resource_uri;
    this.activity_name = input.activity_name;
    this.description = input.description;

    this.score =
      typeof input.score == "number" ? input.score : parseInt(input.score);
    this.resource_id = input.resource_id;

    return this;
  }

  categoryColor() {
    const converter = {
      "tw-text-green-100 tw-bg-green-500": "generation",
      "tw-text-orange-100 tw-bg-orange-500": "revision",
      "tw-text-red-100 tw-bg-red-500": "invalidation",
    };

    return _.mapValues(converter, (category) => category == this.category);
  }

  matchesReport(report: Report): boolean {
    return (
      report.activity_term == this.activity_term &&
      report.resource_id == this.resource_id
    );
  }

  itemize() {
    return {
      value: this.activity_term,
      text: this.activity_name,
    };
  }

  get name() {
    return this.activity_name;
  }
}
