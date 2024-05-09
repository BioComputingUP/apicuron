import { Injectable } from '@nestjs/common';
import { PipelineStage } from 'mongoose';
import { days } from '../constants';
import { GroupEntries } from '../interfaces/operations.interface';

@Injectable()
export class AggregateDaysService {
	static days = days;

	map(): PipelineStage[] {
		const fields: PipelineStage.AddFields['$addFields'] = {};
		AggregateDaysService.days.forEach((day, index) => {
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
		AggregateDaysService.days.forEach((day) => {
			groupParams[day] = { $sum: `$${day}` };
		});

		return groupParams;
	}

	postGroup(): PipelineStage[] {
		const daysObj: PipelineStage.AddFields['$addFields'] = {};
		const projectObj: PipelineStage.Project['$project'] = {};
		AggregateDaysService.days.forEach((day) => {
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
