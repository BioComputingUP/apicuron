import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { from, of, Subject, Subscription, switchMap } from 'rxjs';
import { AllEntityEventClasses } from '../interfaces/entity-repository';

type SourceEvent = AllEntityEventClasses;
type DestEvent<ARGS> = new (...args: ARGS[]) => InstanceType<SourceEvent>;

export class RepositoryEventPublisher<
	Event extends { name: string; value: unknown },
> {
	subscription: Subscription;
	logger = new Logger(RepositoryEventPublisher.name);

	_publisher = new Subject<Event>();

	publish(event: Event) {
		this._publisher.next(event);
	}

	pushToEventEmitter(
		eventEmitter: EventEmitter2,
		eventMap: [SourceEvent, DestEvent<unknown>][],
	) {
		this.subscription = this._publisher
			.pipe(
				switchMap((event: Event) => {
					const mapFound =
						eventMap.find(
							([sourceEvent, _destEvent]: [
								SourceEvent,
								new (...args: unknown[]) => unknown,
							]) => sourceEvent.name === event.name,
						) || [];
					if (!mapFound) {
						this.logger.warn(`No mapping found for event: ${event.name}`);
						return of(null);
					}
					const [_sourceEvent, DestEvent] = mapFound;
					const payload = Object.assign(new DestEvent(), event.value);
					return from(eventEmitter.emitAsync(DestEvent.name, payload));
				}),
			)
			.subscribe();
	}

	destroy() {
		this.subscription?.unsubscribe();
	}
}
