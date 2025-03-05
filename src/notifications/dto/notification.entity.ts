import { Expose } from 'class-transformer';

export class NotificationEntity {
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
