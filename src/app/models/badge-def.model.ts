import { Deserializable, Serializable } from "../interfaces/deserializable.model";
import { AcheivementDef } from "./achievement-def";
import { Term } from "./term.model";

export type DeleteBadgeDef =  Pick<BadgeDef, 'name' | 'resource_id'>;
export type UpdateBadgeDef = Partial<BadgeDef> & DeleteBadgeDef;

export class BadgeDef extends AcheivementDef implements Deserializable, Serializable {
    serialize(): any {
        return Object.assign({}, this);
    }
    deserialize(input: any): this {
        this.color_code = this.color = input.color_code
        this.count_threshold = input.count_threshold
        this.name = input.name
        this.list_terms = input.list_terms
        this.resource_id = input.resource_id
        this.resource_uri = input.resource_uri
        this.startDate = !!input.startDate ? new Date(input.startDate) : null;
        this.endDate = !!input.endDate ? new Date(input.endDate) : null;
        // this.image = input.image
        return this
    }
    
    // image?: string
    endDate: Date | null;
    startDate: Date | null;
    color_code?: string = ''
    count_threshold: number = 1;


    getRelatedTerms(terms: Term[]) {
        return terms.filter(term => this.list_terms.includes(term.activity_term))
    }

}