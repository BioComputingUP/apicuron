import moment from "moment";
import { Deserializable } from "src/app/interfaces/deserializable.model";
import { Term } from "src/app/models/term.model";


export class Report implements Deserializable {
    deserialize(input: any): this {
        this.name = input.activity_term
        this.activity_term = input.activity_term
        this.term = input.term || null
        this.timestamp = new Date(input.timestamp)
        this.resource_id = input.resource_id
        this.curator_orcid = input.curator_orcid
        this.entity_uri = input.entity_uri

        if(input.term){
            this.term = new Term().deserialize(input.term);
        }
        
        return this
    }

    get formattedDate () {
        const dateTime = moment(this.timestamp)
        return dateTime.format('MMMM Do YYYY, h:mm');
    }

    formatDate(type: 'dateTime' | 'date'){
        const dateTime = moment(this.timestamp)
        return type == 'dateTime' ? dateTime.format('MMMM Do YYYY, h:mm:ss a') : dateTime.format('MMMM Do YYYY')
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