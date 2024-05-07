import { Injectable } from '@nestjs/common';
import { PipelineStage } from 'mongoose';
import { days } from '../constants';
import { GroupEntries } from '../interfaces/operations.interface';

@Injectable()
export class AggregateDaysService {
	days = days;

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

	group(): GroupEntries {
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
