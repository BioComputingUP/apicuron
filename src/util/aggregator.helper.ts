import { EntityCreatedEvent } from 'src/core/events/entity-created.event';
import { EntityUpdatedEvent } from 'src/core/events/entity-updated.event';
import { UserDocument } from 'src/core/schemas/user.schema';
import { throwError, UnexpectedError } from './error.utils';

export function get_user_from_event(
	event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>,
): UserDocument {
	if (event instanceof EntityCreatedEvent) {
		return event.instance;
	}
	if (event instanceof EntityUpdatedEvent) {
		return event.after;
	}
	throwError(
		UnexpectedError,
		'get_user_from_event: event is not an EntityCreatedEvent or EntityUpdatedEvent',
	);
}
