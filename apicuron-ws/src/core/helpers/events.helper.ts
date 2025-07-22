import { EntityCreatedEvent } from 'src/core/events/entity-created.event';
import { EntityUpdatedEvent } from 'src/core/events/entity-updated.event';
import { throwError, UnexpectedError } from 'src/util/error.utils';

/**
 * Extracts the subject (instance or after) from an EntityCreatedEvent or EntityUpdatedEvent.
 * @template T The type of the document associated with the event.
 * @param {EntityCreatedEvent<T> | EntityUpdatedEvent<T>} event The event to extract the subject from.
 * @returns {T} The subject of the event, which is the instance for EntityCreatedEvent and the after for EntityUpdatedEvent.
 * @throws {Error} If the event is neither an EntityCreatedEvent nor an EntityUpdatedEvent.
 */

export function getEventSubject<T>(
	event: EntityCreatedEvent<T> | EntityUpdatedEvent<T>,
): T {
	if (event instanceof EntityCreatedEvent) {
		return event.instance;
	}
	if (event instanceof EntityUpdatedEvent) {
		return event.after;
	}
	throwError(
		UnexpectedError,
		'getEventSubject: event is not an EntityCreatedEvent or EntityUpdatedEvent',
	);
}
