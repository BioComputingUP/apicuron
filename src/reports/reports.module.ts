import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ReportsController, ReportsControllerV2 } from './reports.controller';
import { Report, ReportSchema } from './reports.schema';
import { ReportsService } from './reports.service';
import { ConfigService } from '@nestjs/config';
import { ResourcesModule } from '../resources/resources.module';
import { HttpModule } from '@nestjs/axios';
import { TermsModule } from '../terms/terms.module';

@Module({
	controllers: [ReportsControllerV2, ReportsController],
	providers: [ReportsService],
	imports: [
		HttpModule,
		AuthModule,
		ResourcesModule,
		TermsModule,
		MongooseModule.forFeature([
			{
				name: Report.name,
				schema: ReportSchema,
			}
		]),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
			  secret: configService.get('JWT_SECRET'),
			}),
		  }),
	],
	exports: [ReportsService]
})
export class ReportsModule {}
