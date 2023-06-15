import { Deserializable } from "../interfaces/deserializable.model";



export class Term implements Deserializable {
    category: string;
    activity_term: string;
    resource_uri?: string;
    activity_name: string;
    description: string;
    score: number;
    resource_id: string;
    quartile?: number;

    deserialize(input: any): this {

        this.category = input.activity_category;
        this.activity_term = input.activity_term;
        this.resource_uri = input.resource_uri;
        this.activity_name = input.activity_name;
        this.description = input.description;

        this.score = typeof input.score == 'number' ? input.score : parseInt(input.score);
        this.resource_id = input.resource_id

        return this
    }

    itemize(){
        return {
            value: this.activity_term,
            text: this.activity_name
        }
    }

    get name() {
        return this.activity_name
    }

    static computeTermScoreQuartile(terms: Term[]) {
        terms.sort((a, b) => a.score - a.score)
        let q1 = terms.length / 4;
        let q3 = terms.length * 3 / 4

        return terms.map((term, index) => {
            if (index < q1) {
                term.quartile = 1
                return term
            }
            if (index > q3) {
                term.quartile = 3
                return term
            }
            term.quartile = 2
            return term
        })
    }

}