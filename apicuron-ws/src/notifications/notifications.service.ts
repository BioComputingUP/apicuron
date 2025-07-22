import { Injectable, SerializeOptions } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Notification } from '../core/schemas/notification.schema';
import { NotificationFilter } from './dto/notification-filter.dto';
import { paginate, Paginated } from '../pagination/paginator';
import { plainToInstance } from 'class-transformer';
import { NotificationEntity } from './dto/notification.entity';

@Injectable()
export class NotificationsService {
	constructor(
		@InjectModel(Notification.name)
		protected notificationModel: Model<Notification>,
	) { }

	async getNotifications(orcid_id: string, filter: NotificationFilter) {
		const data =
			(await this.notificationModel.find(
				{
					orcid_id,
					...filter.omitPagination(),
				},
				{},
				{ ...filter.getMongoQueryOptions() },
			)) ?? [];

		const count = await this.notificationModel.count({
			orcid_id,
			...filter.omitPagination(),
		});


		return paginate<NotificationEntity>(NotificationEntity, data, filter, count);
	}

	async get_new_user_notification(orcid_id: string) {
		const data = await this.notificationModel
			.find({ orcid_id: orcid_id, seen: false })
			.sort({ created_at: -1 });

		return data;
	}

	async get_user_notifications(orcid_id: string) {
		const data = await this.notificationModel.find({ orcid_id: orcid_id });
		return data;
	}

	async delete_notification(id: mongoose.Types.ObjectId, orcid_id: string) {
		return await this.notificationModel.remove({ _id: id, orcid_id });
	}

	async clear_user_notifications(orcid_id: string) {
		return await this.notificationModel.deleteMany({ orcid_id });
	}

	async get_new_notification_count(orcid_id: string) {
		return await this.notificationModel.count({ orcid_id, seen: false });
	}

	async set_notification_as_seen(
		id: mongoose.Types.ObjectId,
		orcid_id: string,
	) {
		return (
			await this.notificationModel.updateOne(
				{ _id: id, orcid_id },
				{ seen: true },
			)
		).modifiedCount;
	}

	async create_user_notification(
		title: string,
		body: string,
		orcid_id: string,
	) {
		const notification = new this.notificationModel({
			title,
			body,
			orcid_id,
			seen: false,
		});

		await notification.save();

		return notification;
	}
}
