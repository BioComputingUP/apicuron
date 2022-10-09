import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
	NotificationSchema,
	Notification,
} from './schemas/notification.schema';
import { AuthModule } from '../auth/auth.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
	providers: [NotificationsService],
	controllers: [NotificationsController],
	imports: [
    AuthModule,
    JwtModule,
		MongooseModule.forFeature([
			{
				schema: NotificationSchema,
				name: Notification.name,
			},
		]),
	],
})
export class NotificationsModule {}
