import { Deserializable } from "../interfaces/deserializable.model"
import { AcheivementDef } from "./achievement-def"


export class MedalDef extends AcheivementDef implements Deserializable{
    deserialize(input: any): this {
        this.name = input.name
        this.list_terms = input.terms
        this.resource_id = input.resource_id
        this.resource_uri = input.resource_uri
        this.color = input.color
        this.first_day = new Date(input.first_day)
        this.last_day = new Date(input.last_day)
        this.score_relative = input.score_relative
        return this
    }

    first_day: Date
    last_day: Date
    name: string
    score_relative: number
}