import { MedalDefDocument } from '../../core/schemas/achievements-def/medal-def.schema';

export class MedalDefUpdatedEvent {
	constructor(public medalDef: MedalDefDocument) {}
}
