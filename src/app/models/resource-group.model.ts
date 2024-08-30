import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Serializable } from "../interfaces/deserializable.model";
import { Deserializable } from "./deserializable";
import { map, takeWhile } from "rxjs/operators";
import _ from "lodash";
import { IdentifierValdiator } from "../validators/identifier-validator";
type ObjectValues<T> = T[keyof T];

// Types
export const PrivacyType = {
  private: "private",
  public: "public",
} as const;
export type PrivacyType = ObjectValues<typeof PrivacyType>;

export type ResourceGroupCreateForm = {
  name: FormControl<string>;
  displayedName: FormControl<string>;
  defaultMembers: FormControl<string[]>;
  visibility: FormControl<PrivacyType>;
};

export class ResourceGroup implements Deserializable, Serializable {
  serialize(): Record<string, any> {
    return {
      visibility: this.visibility,
      defaultMembers: this.defaultMembers,
      resource_id: this.resource_id,
      name: this.name,
      displayedName: this.displayedName,
    };
  }
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

  static generateCreateForm(
    fb: FormBuilder
  ): FormGroup<ResourceGroupCreateForm> {
    const form = fb.group({
      name: ["", [Validators.required, Validators.minLength(3), IdentifierValdiator()]], // matches kebab case
      displayedName: ["", [Validators.required, Validators.minLength(3)]],
      defaultMembers: new FormControl<string[]>([]),
      visibility: new FormControl<PrivacyType>(PrivacyType.public),
    });

    return form;
  }

  generateUpdateForm(
    fb: FormBuilder,
    group: ResourceGroup
  ): FormGroup<ResourceGroupCreateForm> {
    const form = fb.group({
      name: [group.name, [Validators.required, Validators.minLength(3), IdentifierValdiator()]], // matches kebab case
      displayedName: [group.displayedName, [Validators.required, Validators.minLength(3)]],
      defaultMembers: [group.defaultMembers],
      visibility: group.visibility,
    });

    return form;
  }

  fromForm(fg: FormGroup<ResourceGroupCreateForm>): this {
    this.name = fg.get("name").value;
    this.displayedName = fg.get("displayedName").value;
    this.defaultMembers = fg.get("defaultMembers").value;
    this.visibility = fg.get("visibility").value;
    return this;
  }
}
