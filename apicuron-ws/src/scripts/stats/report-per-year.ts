import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../app.module';
import { Report, ReportModel } from '../../core/schemas/reports.schema';
import { TIMEZONE } from '../../util/date.helper';

const logger = new Logger('ReportStatsByMonth');

async function main() {
	const app = await NestFactory.createApplicationContext(AppModule);
	const reportModel = app.get<ReportModel>(getModelToken(Report.name));

	try {
		const rows = await reportModel.aggregate([
			{
				$addFields: {
					effectiveTimestamp: {
						$cond: [
							{
								$and: [
									{ $ne: ['$resource.joined_date', null] },
									{ $lt: ['$timestamp', '$resource.joined_date'] },
								],
							},
							'$resource.joined_date',
							'$timestamp',
						],
					},
				},
			},
			{
				$addFields: {
					reportYear: {
						$year: {
							date: '$effectiveTimestamp',
							timezone: TIMEZONE,
						},
					},
					reportMonth: {
						$month: {
							date: '$effectiveTimestamp',
							timezone: TIMEZONE,
						},
					},
				},
			},
			{
				$group: {
					_id: {
						year: '$reportYear',
						month: '$reportMonth',
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { '_id.year': 1, '_id.month': 1 } },
			{
				$project: {
					_id: 0,
					period: {
						$concat: [
							{ $toString: '$_id.year' },
							'-',
							{
								$cond: [
									{ $lt: ['$_id.month', 10] },
									{ $concat: ['0', { $toString: '$_id.month' }] },
									{ $toString: '$_id.month' },
								],
							},
						],
					},
					count: 1,
				},
			},
		]);

		console.log('period,count');
		for (const row of rows) {
			console.log(`${row.period},${row.count}`);
		}
	} finally {
		await app.close();
	}
}

if (require.main === module) {
	main().catch((error) => {
		logger.error(error?.message ?? error, error?.stack);
		process.exitCode = 1;
	});
}
