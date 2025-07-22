import { InjectModel } from '@nestjs/mongoose';
import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import {
	AchievementDef,
	AchievementDefDocument,
	AchievementDefModel,
} from '../../core/schemas/achievements-def/achievement-def.schema';

@ValidatorConstraint({ name: 'AchievementExists', async: true })
abstract class AbstractAchievementUnique
	implements ValidatorConstraintInterface
{
	constructor(
		@InjectModel(AchievementDef.name)
		private achievementDefModel: AchievementDefModel,
	) {}

	type: string;

	async achievement_def_exists(
		name: string,
		resource_id: string,
	): Promise<boolean> {
		if (this.type) {
			return !!(await this.achievementDefModel.exists({
				name,
				type: this.type,
				resource_id,
			}));
		} else {
			throw new Error(
				'Type attribute missing from class ' + this.constructor.name,
			);
		}
	}

	async validate(value: any, args?: ValidationArguments): Promise<boolean> {
		if (!args || !args.object['resource_id']) {
			throw new Error(
				'Resource ID is required in the validated object for ' +
					this.constructor.name,
			);
		}
		const exists = await this.achievement_def_exists(
			value,
			args.object['resource_id'],
		);
		if (args.constraints && args.constraints.find((x) => x.reverse == true)) {
			if (!exists) {
				throw new NotFoundException(`${this.type} named (${value}) Not found`);
			}
			return exists;
		}
		return !exists;
	}

	defaultMessage(args?: ValidationArguments): string {
		if (!args || !args.object['resource_id']) {
			throw new Error(
				'Cannot build error message with missing validationArguments (ResourceId)' +
					this.constructor.name,
			);
		}
		let error_snippet = 'already exists';

		if (args.constraints && args.constraints.find((x) => x.reverse == true)) {
			error_snippet = 'does not Exist';
		}

		return `${this.type} named ${args.value} ${error_snippet} for resource ${args.object['resource_id']}`;
	}
}

/**
 * @Param {*[]} constraints
 * @Description
 * Validator that checks if the badge name does NOT exist for specified resource
 * Requires a resource_id parameter to be present in the validated object
 * behavior can be reversed by passing { reverse: true } in the constraints array
 *
 */
@ValidatorConstraint({ name: 'BadgeExists', async: true })
export class BadgeUnique extends AbstractAchievementUnique {
	type = 'badge';
}

/**
 * @Param {*[]} constraints
 * @Description
 * Validator that checks if the medal name does Not exist for specified resource
 * Requires a resource_id parameter to be present in the validated object
 * behavior can be reversed by passing { reverse: true } in the constraints array
 *
 */
@ValidatorConstraint({ name: 'MedalExists', async: true })
export class MedalUnique extends AbstractAchievementUnique {
	type = 'medal';
}
