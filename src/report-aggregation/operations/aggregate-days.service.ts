import { Injectable } from '@nestjs/common';
import { PipelineStage } from 'mongoose';

@Injectable()
export class AggregateDaysService {
	days = [
		'monday',
		'tuesday',
		'wednesday',
		'thursday',
		'friday',
		'saturday',
		'sunday',
	];

	map(): PipelineStage[] {
		const fields: PipelineStage.AddFields['$addFields'] = {};
		this.days.forEach((day, index) => {
			fields[day] = {
				$cond: {
					if: {
						$eq: [{ $dayOfWeek: '$timestamp' }, index + 1],
					},
					then: 1,
					else: 0,
				},
			};
		});
		return [{ $addFields: fields }];
	}

	group(): PipelineStage.Group['$group'] {
		const groupParams = {};
		this.days.forEach((day) => {
			groupParams[day] = { $sum: `$${day}` };
		});

		return groupParams;
	}

	postGroup(): PipelineStage[] {
		const daysObj: PipelineStage.AddFields['$addFields'] = {};
		const projectObj: PipelineStage.Project['$project'] = {};
		this.days.forEach((day) => {
			daysObj[day] = `$${day}`;
			projectObj[day] = 0;
		});
		return [
			{
				$addFields: {
					days: daysObj,
				},
			},
			{
				$project: projectObj,
			},
		];
	}
}
