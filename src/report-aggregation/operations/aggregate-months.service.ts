import { Injectable } from '@nestjs/common';
import { Operation } from '../interfaces/operations.interface';
import { PipelineStage, AccumulatorOperator } from 'mongoose';

@Injectable()
export class AggregateMonthsService implements Operation {
	months = [
		'january',
		'february',
		'march',
		'april',
		'may',
		'june',
		'july',
		'august',
		'september',
		'october',
		'november',
		'december',
	];
	map(): PipelineStage[] {
		const fields: PipelineStage.AddFields['$addFields'] = {};
		this.months.forEach((month, index) => {
			fields[month] = {
				$cond: {
					if: {
						$eq: [{ $month: '$timestamp' }, index + 1],
					},
					then: 1,
					else: 0,
				},
			};
		});

		return [{ $addFields: fields }];
	}
	group(): { [key: string]: AccumulatorOperator } {
		const groupParams = {};
		this.months.forEach((month) => {
			groupParams[month] = { $sum: `$${month}` };
		});

		return groupParams;
	}
	postGroup(): PipelineStage[] {
		const monthsObj: PipelineStage.AddFields['$addFields'] = {};
		const projectObj: PipelineStage.Project['$project'] = {};
		this.months.forEach((month) => {
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
