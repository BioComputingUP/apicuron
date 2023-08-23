import { InjectModel } from "@nestjs/mongoose";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Model } from "mongoose";
import { User, UserDocument } from "../../core/schemas/user.schema";



@ValidatorConstraint({ name: 'OrcidExists', async: true })
export class OrcidExists implements ValidatorConstraintInterface {

    constructor(@InjectModel(User.name) protected userModel: Model<UserDocument>) {}

    async validate(orcid_id: any, validationArguments?: ValidationArguments): Promise<boolean> {
        return !! await this.userModel.exists({ orcid_id })
    }

    defaultMessage(args?: ValidationArguments): string {
        return `orcid ID (${args.value}) does not exist`
    }
}