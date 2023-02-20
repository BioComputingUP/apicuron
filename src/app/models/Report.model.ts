import { Deserializable } from "./deserializable"
import * as _ from 'lodash'
export class Report implements Deserializable {

    timestamp: Date
    activity_term: string
    resource_id: string
    curator_orcid: string
    entity_uri: string

    deserialize(input: any) {
        Object.assign(this, input)
        return this
    }

}

export class ReportFilter {
    activity_term?: string
    entity_uri?: string
    orcid_id?: string
    resource_id?: string
    from?: Date
    to?: Date
    page?: number
    page_size?: number


    static serialize(filter: ReportFilter): Omit<ReportFilter, 'from' | 'to'> & { from?: string, to?: string} {
        let reportFilter: any = Object.assign({}, filter)

        if(filter.from){
            reportFilter.from = [filter.from.getFullYear(), filter.from.getMonth() + 1, filter.from.getDate()].join('-')
        }
        if(filter.to){
            reportFilter.to = [filter.to.getFullYear(), filter.to.getMonth() + 1, filter.to.getDate()].join('-')
        }
        return reportFilter
    }
}


export class ReportStatistics implements Deserializable {
    deserialize(input: any): this {
        Object.assign(this, input)
        this.timestamp = new Date(this.timestamp)
        return this
    }

    timestamp: Date
    activity_terms: string[]
    count: number
    resource_ids: string[]
    curator_orcids: string[]

    
}
