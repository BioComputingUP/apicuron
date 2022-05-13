import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ReportsController } from './reports.controller';
import { Report, ReportSchema } from './reports.schema';
import { ReportsService } from './reports.service';
import { ConfigService } from '@nestjs/config';

@Module({
	controllers: [ReportsController],
	providers: [ReportsService],
	imports: [
		AuthModule,
		MongooseModule.forFeature([
			{
				name: Report.name,
				schema: ReportSchema,
			},
		]),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
			  secret: configService.get('JWT_SECRET'),
			}),
		  }),
	],
})
export class ReportsModule {}
