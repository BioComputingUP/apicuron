import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';
import { ActivityTermExists } from './validators/activity-term-exists';
import { CoreApicuronModule } from '../core/core.module';
import { MedalsModule } from '../medals/medals.module';
import { BadgesModule } from '../badges/badges.module';



@Module({
    controllers: [
        TermsController
    ],
    providers: [
        TermsService,
        ActivityTermExists,
    ],
    imports: [
        CoreApicuronModule,
        AuthModule,
        JwtModule,
        ResourcesModule,
        MedalsModule,
        BadgesModule,
    ],
    exports: [
        TermsService,
        ActivityTermExists
    ],

})
export class TermsModule { }