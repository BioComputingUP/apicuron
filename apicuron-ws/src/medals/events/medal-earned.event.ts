import { MedalDocument } from '../../core/schemas/achievements/medals.schema';

export class MedalEarnedEvent {
	constructor(public readonly medal: MedalDocument) {}
}
