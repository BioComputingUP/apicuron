import { Deserializable } from "src/app/interfaces/deserializable.model";
import { BadgeDef } from "src/app/models/badge-def.model";



export class Badge extends BadgeDef implements Deserializable {

    deserialize(input: any): this {
        super.deserialize(input);
        this.curator_orcid = input.curator_orcid;
        
        return this
    }

    curator_orcid: string

}