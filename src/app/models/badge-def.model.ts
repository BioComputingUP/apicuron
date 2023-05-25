import { Deserializable } from "../interfaces/deserializable.model";
import { AcheivementDef } from "./achievement-def";
import { Term } from "./term.model";



export class BadgeDef extends AcheivementDef implements Deserializable {
    deserialize(input: any): this {
        this.color_code = this.color = input.color_code
        this.count_threshold = input.count_threshold
        this.name = input.name
        this.list_terms = input.list_terms
        this.resource_id = input.resource_id
        this.resource_uri = input.resource_uri
        this.image = input.image
        return this
    }

    image?: string
    color_code?: string
    count_threshold: number


    getRelatedTerms(terms: Term[]) {
        return terms.filter(term => this.list_terms.includes(term.activity_term))
    }

}