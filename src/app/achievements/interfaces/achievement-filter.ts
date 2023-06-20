import { Serializable } from "src/app/interfaces/deserializable.model";



export class AchievementFilter implements Serializable {
    serialize(): any {

        const entries = Object.entries(this)

        let result = {}
        entries.forEach(([attr, value]) => {
            result[attr] = String(value)
        })

        return result;
    }


    static create(filter: any){
        const achievementFilter = new AchievementFilter()
        Object.assign(achievementFilter, filter)
        return achievementFilter;
    }

    curator_orcid?: string;
    resource_id?: string;
    page_size?: number;
    page?: number;
    name?: string;
    sortBy?: 'curator_threshold' | 'name'
    sortOrder?: '1' | '-1' | 'asc' | 'desc'

} 