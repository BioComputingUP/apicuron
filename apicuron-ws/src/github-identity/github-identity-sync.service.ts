import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContributorIdentifierType } from 'src/core/enums';
import { UserOrcidIdentifiedEvent } from '../auth/users/events/orcid-identified.event';
import {
	GithubAccount,
	GithubAccountSource,
	GithubAccountStatus,
} from '../core/schemas/components/github-account.schema';
import { User, UserDocument } from '../core/schemas/user.schema';
import { githubLoginsFromLinks } from './github-profile-links';
import { GithubUsersClient } from './github-users.client';

@Injectable()
export class GithubIdentitySyncService {
	private readonly logger = new Logger(GithubIdentitySyncService.name);

	constructor(
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
		private readonly github: GithubUsersClient,
		private readonly events: EventEmitter2,
	) {}

	/**
	 * Reconciles a user's GitHub accounts with the GitHub profile URLs on their ORCID record,
	 * then reconciles pending reports for newly linked accounts. Resolves when reconciliation is done.
	 */
	async syncUser(orcid: string): Promise<void> {
		const user = await this.userModel.findOne({ orcid_id: orcid }, { links: 1, github_accounts: 1 }).lean();
		if (!user) return;

		const now = new Date();
		const accounts: GithubAccount[] = [...(user.github_accounts ?? [])];
		const newlyLinked: string[] = [];

		for (const login of githubLoginsFromLinks(user.links ?? [])) {
			//  already stored under this login, so no GitHub call
			const known = accounts.find((a) => a.login.toLowerCase() === login.toLowerCase()); // usernames are case-insensitive on GitHub
			if (known) {
				known.last_verified_at = now;
				continue;
			}

			const githubId = await this.github.findUserId(login);
			if (!githubId) {
				this.logger.warn(`Ignoring GitHub link "${login}" for ${orcid}: not found or an organisation`);
				continue;
			}

			// Same account, renamed on GitHub: update the login, nothing to reconcile
			const renamed = accounts.find((a) => a.github_id === githubId);
			if (renamed) {
				renamed.login = login;
				renamed.last_verified_at = now;
				continue;
			}

			// New account. If another user already claims it, both become conflicts and credits stay pending.
			const conflict = await this.claimedByAnotherUser(githubId, orcid);
			if (conflict) await this.markConflictForOthers(githubId, orcid);

			accounts.push({
				github_id: githubId,
				login,
				source: GithubAccountSource.ORCID_RESEARCHER_URL,
				first_observed_at: now,
				last_verified_at: now,
				status: conflict ? GithubAccountStatus.CONFLICT : GithubAccountStatus.ACTIVE,
			});
			if (!conflict) newlyLinked.push(githubId);
		}

		await this.userModel.updateOne({ orcid_id: orcid }, { $set: { github_accounts: accounts } });

		for (const githubId of newlyLinked) {
			await this.events.emitAsync(
				UserOrcidIdentifiedEvent.eventName,
				new UserOrcidIdentifiedEvent(githubId, ContributorIdentifierType.GITHUB, orcid),
			);
		}
	}

	private async claimedByAnotherUser(githubId: string, orcid: string): Promise<boolean> {
		const other = await this.userModel.exists({ orcid_id: { $ne: orcid }, 'github_accounts.github_id': githubId });
		return !!other;
	}

	private async markConflictForOthers(githubId: string, orcid: string): Promise<void> {
		await this.userModel.updateMany(
			{ orcid_id: { $ne: orcid }, 'github_accounts.github_id': githubId },
			{ $set: { 'github_accounts.$[account].status': GithubAccountStatus.CONFLICT } },
			{ arrayFilters: [{ 'account.github_id': githubId }] },
		);
	}
}