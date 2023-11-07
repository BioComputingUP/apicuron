import {
	Controller,
	Get,
	UseGuards,
	Req,
	Delete,
	Param,
	Query,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags, ApiSecurity } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { AuthorizationHeader, VersionHeader } from '../swagger/config';
import { NotificationsService } from './notifications.service';
import { User } from '../auth/decorators/applyUser.decorator';
import { User as UserModel } from '../core/schemas/user.schema';
import { NotificationFilter } from './dto/notification-filter.dto';
import { AuthProtected } from '../auth/decorators/auth.decorator';

@ApiTags('Notifications')
@ApiHeader(VersionHeader)
@Controller({
	path: 'notifications',
	version: '2',
})
export class NotificationsController {
	constructor(private notificationService: NotificationsService) {}

	@ApiOperation({
		description: 'Get the list of notifications for the loggedIn User',
	})
	@Get()
	@AuthProtected()
	async getNotifications(
		@User() user: UserModel,
		@Query() filter: NotificationFilter,
	) {
		console.log({
			pagination: filter.getMongoQueryOptions(),
			seen: filter.seen,
		});
		return await this.notificationService.getNotifications(
			user.orcid_id,
			filter,
		);
	}

	@ApiOperation({
		description: 'Get the number of unseen notifications',
	})
	@Get('count')
	@AuthProtected()
	async get_new_notification_count(@Req() request) {
		return await this.notificationService.get_new_notification_count(
			request.user.orcid_id,
		);
	}

	@ApiOperation({
		description: 'Delete all user notifications',
	})
	@Delete()
	@AuthProtected()
	async clear_notifications(@Req() request) {
		return await this.notificationService.clear_user_notifications(
			request.user.orcid_id,
		);
	}

	@ApiOperation({
		description: 'Delete a specific notification',
	})
	@Delete(':notification_id')
	@AuthProtected()
	async delete_notification(
		@User() user: UserModel,
		@Param('notification_id') notification_id: mongoose.Types.ObjectId,
		@Query('hard-delete') hardDelete: boolean,
	) {
		if (hardDelete) {
			await this.notificationService.delete_notification(
				notification_id,
				user.orcid_id,
			);
		} else {
			return await this.notificationService.set_notification_as_seen(
				notification_id,
				user.orcid_id,
			);
		}
	}
}
