import { Deserializable } from "../../interfaces/deserializable.model";
import * as _ from 'lodash'
export class Notification implements Deserializable {
    
    title: string
    created_at: Date
    body: string
    id: string
    seen: Boolean
    
    
    deserialize(input: any): this {
        const props = _.pick(input, ['title', 'body', '_id', 'id' ])
        if(!props.id && !!props._id){
            props.id = props._id
            delete props._id
        }
        Object.assign(this, props)
        Object.assign(this, {
            created_at: new Date(input.created_at),
            seen: Boolean(input.seen)
        })
        return this
    }

    

}