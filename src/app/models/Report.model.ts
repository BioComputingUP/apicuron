import { Deserializable } from "./deserializable"
import * as _ from 'lodash'
import * as moment from 'moment'
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
    groupBy: 'date'


    static serialize(filter: ReportFilter): Omit<ReportFilter, 'from' | 'to'> & { from?: string, to?: string} {
        let reportFilter: any = Object.assign({}, filter)

        if(filter.from){
            reportFilter.from = moment(filter.from).format('YYYY-MM-DD')
        }
        if(filter.to){
            reportFilter.to = moment(filter.to).format('YYYY-MM-DD')

        }
        return reportFilter
    }
}


export class ReportStatistics implements Deserializable {
    deserialize(input: any): this {
        Object.assign(this, input)
        this.timestamps = this.timestamps.map(timestamp => new Date(timestamp))
        this.date = new Date(this.date)
        return this
    }

    date: Date
    timestamps: Date[]
    activity_terms: string[]
    count: number
    resource_ids: string[]
    curator_orcids: string[]

    
}
