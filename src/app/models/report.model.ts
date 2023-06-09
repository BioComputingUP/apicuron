import { Deserializable } from "src/app/interfaces/deserializable.model";
import { Term } from "src/app/models/term.model";


export class Report implements Deserializable {
    deserialize(input: any): this {
        this.name = input.activity_name
        this.activity_term = input.activity_term
        this.term = input.term || null
        this.timestamp = new Date(input.timestamp)
        this.resource_id = input.resource_id
        this.curator_orcid = input.curator_orcid
        this.entity_uri = input.entity_uri
        
        return this
    }

    name: string
    activity_term: string
    term?: Term
    timestamp: Date
    entity_uri: string
    curator_orcid: string
    resource_id: string
    // resource?: Resource

}