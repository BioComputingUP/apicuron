import ordinal from "ordinal";
import { Deserializable } from "src/app/interfaces/deserializable.model";
import { MedalDef } from "src/app/models/medal-def.model";

class MedalUser implements Deserializable {
  orcid_id: string;
  displayedName: string;
  avatar: URL;

  deserialize(input: any): this {
    this.orcid_id = input.orcid_id;
    this.displayedName = input?.displayedName;
    this.avatar = new URL(input.avatar);
    return this;
  }
}

export class Medal extends MedalDef implements Deserializable {
  deserialize(input: any): this {
    super.deserialize(input);

    this.user = input.user
      ? new MedalUser().deserialize(input?.user)
      : undefined;
    this.curator_orcid = input.curator_orcid;
    this.score_relative_index = input.score_relative_index;
    this.score_threshold_valid = input.score_threshold_valid;
    this.score_total = input.score_total;

    return this;
  }

  user?: MedalUser;
  curator_orcid: string;
  score_relative_index: number;
  score_threshold_valid: Boolean;
  score_total: number;
  // list_terms: string[];

  getRanking(): String {
    return ordinal(this.score_relative_index + 1);
  }
}
