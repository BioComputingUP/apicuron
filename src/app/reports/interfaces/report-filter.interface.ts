import * as _ from "lodash";
import { Serializable } from "src/app/interfaces/deserializable.model";
import { NonFunctionKeys } from "../../interfaces/non-function-keys";

export class ReportFilter implements Serializable {
    
    serialize(): any {
        const entries = Object.entries(this)
        let results = {}

        entries.forEach(([attr, value]) => {

            if(value instanceof Date){
                results[attr] = value.toISOString()
                return
            }
            if(value instanceof Array){
                results[attr +'[]'] = value
                return
            }
            results[attr] = String(value)
        })

        return results
        
    }

    static create(reportFilter: any){
        let filter = new ReportFilter()
        for (const k in reportFilter){
            if(reportFilter[k]!= null && reportFilter[k] != undefined || reportFilter[k] instanceof Array && reportFilter.length > 0){
                filter[k] = reportFilter[k]
            }
        }
        // filter = Object.assign(filter, reportFilter)
        return filter;
    }

    curator_orcid?: string;

    resource_id?: string

    activity_terms?: string[]

    entity_uri?: string

    limit?: number

    skip?: number

    from?: Date

    to?: Date

    sortBy?: 'timestamp' | 'resource_id' | 'entity_uri' | 'curator_orcid' | 'activity_term'

    sortOrder?: 'asc' | 'desc' | 1 | -1



}

export type ReportFilterField = NonFunctionKeys<ReportFilter>

