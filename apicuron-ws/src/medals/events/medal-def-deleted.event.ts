import { MedalDefDocument } from '../../core/schemas/achievements-def/medal-def.schema';

export class MedalDefDeletedEvent {
	constructor(public medalDef: MedalDefDocument) {}
}
