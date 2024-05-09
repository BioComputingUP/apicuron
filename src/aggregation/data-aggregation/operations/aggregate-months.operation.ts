import { Injectable } from '@nestjs/common';
import { GroupEntries, Operation } from '../interfaces/operations.interface';
import { PipelineStage } from 'mongoose';
import { months } from '../constants';

@Injectable()
export class AggregateMonthsService implements Operation {
	static months = months;
	constructor(protected dateField = '$timestamp') {}

	map(): PipelineStage[] {
		const fields: PipelineStage.AddFields['$addFields'] = {};
		AggregateMonthsService.months.forEach((month, index) => {
			fields[month] = {
				$cond: {
					if: {
						$eq: [{ $month: this.dateField }, index + 1],
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
		AggregateMonthsService.months.forEach((month) => {
			groupParams[month] = { $sum: `$${month}` };
		});

		return groupParams;
	}
	postGroup(): PipelineStage[] {
		const monthsObj: PipelineStage.AddFields['$addFields'] = {};
		const projectObj: PipelineStage.Project['$project'] = {};
		AggregateMonthsService.months.forEach((month) => {
			monthsObj[month] = `$${month}`;
			projectObj[month] = 0;
		});
		return [
			{
				$addFields: {
					months: monthsObj,
				},
			},
			{
				$project: projectObj,
			},
		];
	}
}
