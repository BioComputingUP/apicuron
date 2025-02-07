import * as _ from "lodash";
import {
  Deserializable,
  Serializable,
} from "../interfaces/deserializable.model";
import { Report } from "./report.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export type TermCategory = "generation" | "invalidation" | "revision";

export class Term implements Deserializable, Serializable {
  serialize(): any {
    return {
      activity_term: this.activity_term,
      resource_id: this.resource_id,
      activity_category: this.category,
      score: this.score,
      description: this.description,
    }
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

  static createForm(fb: FormBuilder, resource_id: string): FormGroup {
    return fb.group({
      resource_id: [resource_id, [Validators.required]], // Resource ID will be set automatically
      activity_term: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(8)]],
      activity_category: ["generation", [Validators.required]],
      activity_name: ["", [Validators.required]],
      score: ["", [Validators.required, Validators.min(1)]],
      description: ["", [Validators.required]],
    });
  }

  getUpdateForm(fb: FormBuilder): FormGroup {
    const form = fb.group({
      resource_id: [this.resource_id, [Validators.required]],
      activity_term: [this.activity_term, [Validators.required]],
      activity_category: [this.category, [Validators.required]],
      activity_name: [this.activity_name, [Validators.required]],
      score: [this.score, [Validators.required, Validators.min(1)]],
      description: [this.description, [Validators.required]],
    });
    return form;
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
