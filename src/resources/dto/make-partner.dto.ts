import { IsNotEmpty, IsString, Validate } from "class-validator";
import { EntryExistsRule } from "../../shared/validators/entry-exists.validator";
import { SubmittedResource } from "../schemas/submitted-resource.schema";

export class MakePartner {
    
    @IsNotEmpty()
    @IsString()
    @Validate(EntryExistsRule, [
        SubmittedResource.name,
        (resource_id) => {
            return {
                resource_id
            }
        }
    ])
    resource_id:string
}