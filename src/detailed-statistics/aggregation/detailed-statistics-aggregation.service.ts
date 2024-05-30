import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Aggregate, FilterQuery, Model, PipelineStage } from 'mongoose';
import {
	DayOfWeek,
	DaysOfWeek,
	Month,
	months,
	PrivacyType,
} from '../../core/enums';

export interface DetailedStatAggregationResult {
	_id: {
		resource_id: string;
		curator_orcid: string;
		league: string;
		activity_term: string;
	};
	resource_id: string;
	curator_orcid: string;
	league: string;
	activity_term: string;
	privacy: PrivacyType;
	count: number;
	last_contribution: Date;
	first_contribution: Date;
	days: [number, number, number, number, number, number, number];
	months: { [key in Month]: number };
}

@Injectable()
export class DetailedStatisticsPipeline implements OnModuleInit {
	addFieldsDaysArrayStage: { days: any };
	removeDayPropertiesStage: { [k: string]: number };
	addDayPropertiesStage: any;
	countMonthFieldsStage: PipelineStage.AddFields['$addFields'];
	addmonthsObjectStage: { months: Record<string, any> };
	removeMonthProperties: PipelineStage.Project['$project'];
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}
	onModuleInit() {
		this.initDaysPipelineStages();
		this.initMonthsPipelineStages();
	}

	initDaysPipelineStages() {
		this.addFieldsDaysArrayStage = {
			days: DaysOfWeek.map((day) => `$${day}`),
		};

		this.removeDayPropertiesStage = Object.fromEntries(
			DaysOfWeek.map((day) => [day, 0]),
		);

		this.addDayPropertiesStage = Object.fromEntries(
			DaysOfWeek.map(
				(day, index): [DayOfWeek, PipelineStage.AddFields['$addFields']] => {
					return [
						day,
						{
							$cond: {
								if: {
									$eq: [{ $dayOfWeek: '$timestamp' }, index + 1],
								},
								then: 1,
								else: 0,
							},
						},
					];
				},
			),
		);
	}

	initMonthsPipelineStages() {
		const fields: PipelineStage.AddFields['$addFields'] = {};
		months.forEach((month, index) => {
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
		this.countMonthFieldsStage = fields;

		const monthsObj: PipelineStage.AddFields['$addFields'] = {};
		const projectObj: PipelineStage.Project['$project'] = {};

		months.forEach((month) => {
			monthsObj[month] = `$${month}`;
			projectObj[month] = 0;
		});

		this.addmonthsObjectStage = {
			months: monthsObj,
		};

		this.removeMonthProperties = projectObj;
	}

	daysGroup() {
		return Object.fromEntries(
			DaysOfWeek.map((day: DayOfWeek) => [day, { $sum: `$${day}` }]),
		);
	}

	monthsGroup() {
		const groupParams = {};
		months.forEach((month) => {
			groupParams[month] = { $sum: `$${month}` };
		});

		return groupParams;
	}

	/**
	 * Returns the the aggregate
	 */
	aggregate(
		filter: FilterQuery<ReportDocument>,
	): Aggregate<DetailedStatAggregationResult[]> {
		return this.reportModel
			.aggregate()
			.match(filter)
			.addFields(this.countMonthFieldsStage)
			.addFields(this.addDayPropertiesStage)
			.group({
				_id: {
					resource_id: '$resource_id',
					curator_orcid: '$curator_orcid',
					league: '$league',
					activity_term: '$activity_term',
				},
				resource_id: {
					$first: '$resource_id',
				},
				curator_orcid: {
					$first: '$curator_orcid',
				},
				league: {
					$first: '$league',
				},
				activity_term: {
					$first: '$activity_term',
				},
				privacy: {
					$first: '$privacy',
				},
				count: {
					$sum: 1,
				},
				last_contribution: {
					$min: '$timestamp',
				},
				first_contribution: {
					$max: '$timestamp',
				},
				...this.monthsGroup(),
				...this.daysGroup(),
			})
			.addFields(this.addFieldsDaysArrayStage)
			.project(this.removeDayPropertiesStage)
			.addFields(this.addmonthsObjectStage)
			.project(this.removeMonthProperties)
			.sort({
				resource_id: -1,
				curator_orcid: -1,
				league: -1,
				activity_term: -1,
			}) as unknown as Aggregate<DetailedStatAggregationResult[]>;
	}
}
