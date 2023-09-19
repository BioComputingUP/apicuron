import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AchievementsModule } from '../achievements/achievements.module';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';
import { ActivityTermExists } from './validators/activity-term-exists';
import { CoreApicuronModule } from '../core/core.module';



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
        AchievementsModule,
    ],
    exports: [
        TermsService,
        ActivityTermExists
    ],

})
export class TermsModule { }