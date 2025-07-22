import { Deserializable } from "src/app/interfaces/deserializable.model"

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