import { Deserializable } from "src/app/interfaces/deserializable.model";
import { BadgeDef } from "src/app/models/badge-def.model";

type ObjectValues<T> = T[keyof T];
export const AchievementState = {
  progress: "progress",
  achieved: "achieved",
} as const;
export type AchievementState = ObjectValues<typeof AchievementState>;

export class Badge extends BadgeDef implements Deserializable {
    progressRate: number;
    
    deserialize(input: any): this {
    super.deserialize(input);
    this.curator_orcid = input.curator_orcid;
    this.state =
      input.state == AchievementState.achieved
        ? AchievementState.achieved
        : AchievementState.progress;
    this.achieved_at = !!input.achieved_at ? new Date(input.achieved_at) : null;
    this.count = input.count;
    this.progressRate = (this.count / this.count_threshold) * 100;

    return this;
  }

  state: AchievementState;
  achieved_at: Date;
  count: number;
  curator_orcid: string;
}
