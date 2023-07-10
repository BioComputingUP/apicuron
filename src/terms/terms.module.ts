import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Report, ReportSchema } from '../reports/reports.schema';
import { ResourcesModule } from '../resources/resources.module';
import { Term, TermSchema } from './schemas/terms.schema';
import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';
import { ActivityTermExists } from './validators/activity-term-exists';



@Module({
    controllers: [
        TermsController
    ],
    providers: [
        TermsService,
        ActivityTermExists
    ],
    exports: [
        MongooseModule,
        TermsService,
        ActivityTermExists
    ],
    imports: [
        AuthModule,
        JwtModule,
        ResourcesModule,
        MongooseModule.forFeature([
            {
                name: Term.name,
                schema: TermSchema,
            },
            {
				name: Report.name,
				schema: ReportSchema,
			}
        ])
    ]
})
export class TermsModule { }