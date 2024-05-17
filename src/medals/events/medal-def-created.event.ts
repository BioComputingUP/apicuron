import { MedalDefDocument } from '../../core/schemas/achievements-def/medal-def.schema';

export class MedalDefCreatedEvent {
	constructor(public medalDef: MedalDefDocument) {}
}
