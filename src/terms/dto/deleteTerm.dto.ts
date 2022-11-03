import { IsNotEmpty, Validate } from "class-validator"
import { ResourceIdExists } from "../../resources/partner-resources/validators/resource-id-exists"
import { ActivityTermExists } from "../validators/activity-term-exists"


export class DeleteTermDto {


    @IsNotEmpty()
    @Validate(ResourceIdExists)
    resource_id: string

    
    @IsNotEmpty()
    @Validate(ActivityTermExists)
    activity_term: string

}