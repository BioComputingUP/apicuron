import { IsNotEmpty, Validate } from "class-validator"
import { ResourceIdExists } from "../partner-resources/validators/resource-id-exists"
import { ActivityTermExists } from "../terms/validators/activity-term-exists"


export class DeleteTermDto {


    @IsNotEmpty()
    @Validate(ResourceIdExists)
    resource_id: string

    
    @IsNotEmpty()
    @Validate(ActivityTermExists)
    activity_term: string

}