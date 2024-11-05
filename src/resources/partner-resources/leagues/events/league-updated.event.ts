import { LeagueDocument } from '../../../../core/schemas/league/league.schema';
import { PartnerResourceDocument } from '../../../../core/schemas/resource/partner-resource.schema';
import { UpdateLeagueDto } from '../dto/update-league.dto';

export class LeagueUpdatedEvent {
	constructor(
		public resource: PartnerResourceDocument,
		public update: UpdateLeagueDto,
		public oldValue: LeagueDocument,
		public league: LeagueDocument,
		public leagueIndex: number,
	) {}

	public getNewDefaultMembers() {
		return this.league.defaultMembers.filter(
			(member) => !this.oldValue.defaultMembers.includes(member),
		);
	}

	public getRemovedDefaultMembers() {
		return this.oldValue.defaultMembers.filter(
			(member) => !this.league.defaultMembers.includes(member),
		);
	}

	public privacyChanged() {
		return this.oldValue.visibility != this.league.visibility;
	}
}
