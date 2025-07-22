import { Expose, Type } from 'class-transformer';
import { ObjectId } from 'mongoose';

export class NotificationEntity {

	@Expose()
	@Type(() => String)
	_id: string;
	
	@Expose()
	title: string;

	@Expose()
	body: string;

	@Expose()
	orcid_id: string;

	@Expose()
	seen: boolean;

	@Expose()
	created_at: Date;
}
