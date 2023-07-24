import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator, ValidationOptions, } from "class-validator";


/**
 * @description Compares current Date field with the first entry in the constraints Array
 * @property {Array} constraints constraints array
 * @property {string | Date} constraints[0]  - The date to compare with 
 * @property {Boolean} constraints[1]  - Whether the comparison is strict or not 
 * 
 */
@ValidatorConstraint({ name: "isBefore", async: false })
export class DateBefore implements ValidatorConstraintInterface {

  validate(propertyValue: string, args: ValidationArguments) {
    if (args.object[args.constraints[0]]) {
      return new Date(propertyValue) < new Date(args.object[args.constraints[0]]);
    } else {
      return true
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `"${args.property}" must be before "${args.constraints[0]}"`;
  }
}



@ValidatorConstraint({ name: "isAfter", async: false })
export class DateAfter implements ValidatorConstraintInterface {

  validate(propertyValue: string, args: ValidationArguments) {
    if (args.object[args.constraints[0]]) {
      return new Date(propertyValue) > new Date(args.object[args.constraints[0]]);
    } else {
      return true
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `"${args.property}" must be after "${args.constraints[0]}"`;
  }
}

