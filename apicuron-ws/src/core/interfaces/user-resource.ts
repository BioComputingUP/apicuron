import { Expose } from 'class-transformer';

export class UserResource {
	@Expose()
	id: string;

	@Expose()
	name: string;

	@Expose()
	resource_id: string;
}
