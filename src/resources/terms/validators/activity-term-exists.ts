import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Injectable, Inject, Logger, InternalServerErrorException } from '@nestjs/common'
import { TermsService } from "../terms.service";
import { Model } from "mongoose";
import { Term, TermDocument } from "../../schemas/terms.schema";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
@ValidatorConstraint({ name: 'ActivityTermExists', async: true})
export class ActivityTermExists implements ValidatorConstraintInterface {

    constructor (@InjectModel(Term.name) private termModel: Model<TermDocument>) {}

    private logger= new Logger(ActivityTermExists.name)

    async validate(value: string, args: ValidationArguments){
        try {
            return !! await this.termModel.exists({ activity_term: value, resource_id: args.object['resource_id']})
            
        } catch(e){
            console.error(
				'Error at the ActivityTermExists validator',
				e.stack,
				e,
			);
			throw new InternalServerErrorException('Internal Server Error');
        }
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return `Activity Term ${validationArguments.object['activity_term']} does not exist on resource ${validationArguments.object['resource_id']}`
    }
}