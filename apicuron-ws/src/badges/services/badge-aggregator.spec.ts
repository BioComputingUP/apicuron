import { Test, TestingModule } from '@nestjs/testing';
import { BadgeAggregatorService } from './badge-aggregator.service';
import { CoreApicuronModule } from '../../core/core.module';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';
import { Model, Connection } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import {
	getModelToken,
	getConnectionToken,
	MongooseModule,
	MongooseModuleOptions,
} from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoEventsModule } from '../../mongo-events/mongo-events.module';
import { loadConfig } from '../../config/load';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('BadgeAggregatorService', () => {
	let service: BadgeAggregatorService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				EventEmitterModule.forRoot({
					wildcard: true,
				}),
				ConfigModule.forRoot({
					isGlobal: true,
					// ignoreEnvFile: true,
					load: [loadConfig()],
				}),
				MongooseModule.forRootAsync({
					inject: [ConfigService],
					imports: [MongoEventsModule],
					useFactory: async (
						configService: ConfigService,
					): Promise<MongooseModuleOptions> => {
						const db_host = configService.get<string>('db_host');
						const database = configService.get<string>('database');
						const port = configService.get<number>('db_port');
						const uri = `mongodb://${db_host}:${port}/${database}`;
						return {
							uri,
						};
					},
				}),
				CoreApicuronModule,
			],
			providers: [
				{
					provide: BadgeAggregatorService,
					inject: [
						getModelToken(BadgeDef.name),
						getModelToken(Report.name),
						getModelToken(Badge.name),
						getConnectionToken(),
					],
					useFactory(
						badgeDefModel: Model<BadgeDefDocument>,
						reportModel: Model<ReportDocument>,
						badgeModel: Model<BadgeDocument>,
						connection: Connection,
					) {
						return new BadgeAggregatorService(
							badgeDefModel,
							reportModel,
							badgeModel,
							connection,
						);
					},
				},
			],
		}).compile();

		service = module.get<BadgeAggregatorService>(BadgeAggregatorService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
