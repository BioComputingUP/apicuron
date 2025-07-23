import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  Deserializable,
  Serializable,
} from "../interfaces/deserializable.model";
import { Paginated } from "../interfaces/paginated";
import { AcheivementDef } from "./achievement-def";

export type DeleteMedalDef = Pick<MedalDef, "name" | "resource_id">;
export type UpdateMedalDef = Partial<MedalDef> & DeleteMedalDef;

export class MedalDef
  extends AcheivementDef
  implements Deserializable, Serializable
{
  serialize() {
    return Object.assign({}, this);
  }

  deserialize(input: any): this {
    this.name = input.name;
    this.list_terms = input.list_terms;
    this.resource_id = input.resource_id;
    this.resource_uri = input.resource_uri;
    this.color = input.color;
    this.first_day = !!input.first_day ? new Date(input.first_day) : null;
    this.last_day = !!input.last_day ? new Date(input.last_day) : null;
    this.score_relative = input.score_relative;
    return this;
  }

  first_day: Date | null = null;
  last_day: Date | null = null;
  name: string = "";
  score_relative: number = 1;

  static colorsPattern =
    /(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/;

  static buildCreateMedalForm(fb: FormBuilder, resource_id: string) {
    const fg = fb.group({
      color: new FormControl<string>("gold", {
        validators: [
          Validators.required,
          Validators.pattern(this.colorsPattern),
        ],
      }),
      list_terms: new FormControl<string[]>([], {
        validators: [Validators.minLength(1)],
        nonNullable: true,
      }),

      name: new FormControl<string>("", {
        validators: [Validators.required, Validators.minLength(1)],
      }),
      score_relative: new FormControl<number>(1, {
        validators: [Validators.required, Validators.min(1)],
      }),
      first_day: new FormControl<Date | null>(null),
      last_day: new FormControl<Date | null>(null),
      resource_id: new FormControl<string>(resource_id, {
        validators: [Validators.minLength(1)],
      }),
      resource_uri: new FormControl<string>(""),
    });
    return fg;
  }

  static buildUpdateMedalForm(
    fbOrForm: FormBuilder | CreateMedalForm,
    medal: MedalDef
  ) {
    let form: FormGroup;
    if (fbOrForm instanceof FormGroup) {
      form = fbOrForm;
    } else {
      form = this.buildCreateMedalForm(fbOrForm, medal.resource_id);
    }

    form.patchValue({
      color: medal.color,
      list_terms: medal.list_terms,
      name: medal.name,
      score_relative: medal.score_relative,
      first_day: medal.first_day,
      last_day: medal.last_day,
      resource_id: medal.resource_id,
      resource_uri: medal.resource_uri,
    });

    return form;
  }
}

export type CreateMedalForm = ReturnType<typeof MedalDef.buildCreateMedalForm>;
