import { Serializable } from "src/app/interfaces/deserializable.model";



export class AchievementDefFilter implements Serializable {

    
    static create(obj: any) {
        this
        const filter = new this();
        Object.assign(filter, obj);
        return filter;
    }

    serialize(): any {

        const entries = Object.entries(this)

        let result = {}
        entries.forEach(([attr, value]) => {
            result[attr] = String(value)
        })

        return result;
    }



    resource_id?: string;
    skip?: number;
    limit?: number;
    name?: string;

} 