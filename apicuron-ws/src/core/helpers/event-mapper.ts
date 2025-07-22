import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { from, of, Subject, Subscription, switchMap } from 'rxjs';

export class RepositoryEventPublisher<
	Event extends { name: string; value: unknown },
> {
	subscription: Subscription;
	constructor() {}
	logger = new Logger(RepositoryEventPublisher.name);

	_publisher = new Subject<Event>();

	publish(event: Event) {
		this._publisher.next(event);
	}

	pushToEventEmitter<SourceEvent extends string, DestEvent extends string>(
		eventEmitter: EventEmitter2,
		eventMap: [SourceEvent, DestEvent][],
	) {
		this.subscription = this._publisher
			.pipe(
				switchMap((event: Event) => {
					const mapFound =
						eventMap.find(
							([sourceEvent, _destEvent]: [SourceEvent, DestEvent]) =>
								sourceEvent === event.name,
						) || [];
					if (!mapFound) {
						this.logger.warn(`No mapping found for event: ${event.name}`);
						return of(null);
					}
					const [sourceEvent, destEvent] = mapFound;
					return from(eventEmitter.emitAsync(destEvent, event.value));
				}),
			)
			.subscribe();
	}

	destroy() {
		this.subscription?.unsubscribe();
	}
}
