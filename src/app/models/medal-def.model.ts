import { Deserializable, Serializable } from "../interfaces/deserializable.model"
import { Paginated } from "../interfaces/paginated";
import { AcheivementDef } from "./achievement-def"

export type DeleteMedalDef = Pick<MedalDef, 'name' | 'resource_id'>;
export type UpdateMedalDef = Partial<MedalDef> & DeleteMedalDef;

export class MedalDef extends AcheivementDef implements Deserializable, Serializable{


    serialize() {
        return Object.assign({}, this);
    }


    deserialize(input: any): this {
        this.name = input.name
        this.list_terms = input.list_terms
        this.resource_id = input.resource_id
        this.resource_uri = input.resource_uri
        this.color = input.color
        this.first_day = new Date(input.first_day)
        this.last_day = new Date(input.last_day)
        this.score_relative = input.score_relative
        return this
    }

    first_day: Date = null
    last_day: Date = null
    name: string = '';
    score_relative: number = 1
}