import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GithubAccountStatus } from '../../core/schemas/components/github-account.schema';
import { User, UserDocument } from '../../core/schemas/user.schema';

@Injectable()
export class GithubIdentityRepository {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

	/** returns ORCID iD of the one user with this active GitHub account (pass numeric GitHub ID); null if none or several (conflict). */
	async findOrcidByGithubId(githubId: string): Promise<string | null> {
		const users = await this.userModel
			.find(
				{ github_accounts: { $elemMatch: { github_id: githubId, status: GithubAccountStatus.ACTIVE } } },
				{ orcid_id: 1 },
			)
			.limit(2) // enough to cause conflcit, regardless it's a rare case
			.lean();
		return users.length === 1 ? users[0].orcid_id : null;
	}
}