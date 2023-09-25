import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CoreApicuronModule } from '../core/core.module';

@Module({
	providers: [NotificationsService],
	controllers: [NotificationsController],
	imports: [
	CoreApicuronModule,
    AuthModule,
    JwtModule,
	],
	exports: [NotificationsService]
})
export class NotificationsModule {}
