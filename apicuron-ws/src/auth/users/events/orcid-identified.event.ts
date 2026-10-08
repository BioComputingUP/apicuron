import { ContributorIdentifierType } from 'src/core/enums';

export class UserOrcidIdentifiedEvent {
	static readonly eventName = 'user.orcid.identified';

	constructor(
		public readonly contributor_identifier: string,
		public readonly contributor_identifier_type: ContributorIdentifierType,
		public readonly orcid: string,
	) {}

	static fromGithub(
		github_username: string,
		orcid: string,
	): UserOrcidIdentifiedEvent {
		return new UserOrcidIdentifiedEvent(
			github_username,
			ContributorIdentifierType.GITHUB,
			orcid,
		);
	}
}
