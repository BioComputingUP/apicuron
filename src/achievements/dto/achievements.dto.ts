import { IsNotEmpty, IsString, Validate } from "class-validator";
import { OrcidExists } from "../../auth/validators/orcidExists.dto";
import { ResourceIdExists } from "../../resources/partner-resources/validators/resource-id-exists";


export class AchievementSelectDto {

    @IsNotEmpty()
    @IsString()
    @Validate(ResourceIdExists)
    resource_id: string;


    @IsNotEmpty()
    @IsString()
    @Validate(OrcidExists)
    orcid_id: string;
}