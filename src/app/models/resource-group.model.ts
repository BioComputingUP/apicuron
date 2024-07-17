import { Deserializable } from "./deserializable";
type ObjectValues<T> = T[keyof T];

// Types
export const PrivacyType = {
  private: "private",
  public: "public",
} as const;
export type PrivacyType = ObjectValues<typeof PrivacyType>;

export class ResourceGroup implements Deserializable {
  name: string;
  displayedName: string;
  resource_id: string;
  defaultMembers: string[];
  visibility: PrivacyType;

  deserialize(input: this): this {
    this.name = input.name;
    this.displayedName = input.displayedName;
    this.resource_id = input.resource_id;
    this.defaultMembers = input.defaultMembers ?? [];
    this.visibility = input.visibility;
    return this;
  }
}
