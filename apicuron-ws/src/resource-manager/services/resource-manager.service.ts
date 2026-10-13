import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PartnerResourceRepository } from 'src/core/repositories/partner-resource.repository';
import { UserRepository } from 'src/core/repositories/user.repository';
import { assertIsDefined } from 'src/util/type-assertion.helper';

export interface ResourceManagerEntry {
	orcid_id: string;
	displayedName: string;
}

@Injectable()
export class ResourceManagerService {
	constructor(
		protected readonly userRepository: UserRepository,
		protected readonly partnerResourceRepo: PartnerResourceRepository,
	) {}

	/**
	 * Makes a known user (one that already logged in to the platform) a manager of a partner resource.
	 * Idempotent: returns `added: false` if the user already manages the resource.
	 */
	async addManager(
		resource_id: string,
		orcid_id: string,
	): Promise<{ added: boolean }> {
		const resource = await this.partnerResourceRepo.findOne({ resource_id });
		assertIsDefined(
			resource,
			`Resource with ID ${resource_id} not found.`,
			NotFoundException,
		);

		const user = await this.getUser(orcid_id);
		if (this.manages(user, resource_id)) {
			return { added: false };
		}

		// Push only if not already a manager (array uniqueness is not enforced by the schema)
		const updated = await this.userRepository.updateOne(
			{ orcid_id, 'resources.resource_id': { $ne: resource_id } },
			{
				$push: {
					resources: { resource_id, name: resource.resource_name },
				},
			},
		);
		this.assertUpdated(updated, orcid_id);

		return { added: true };
	}

	/**
	 * Removes a user from the managers of a resource.
	 * Refuses to remove the last manager, add the replacement first.
	 */
	async removeManager(
		resource_id: string,
		orcid_id: string,
	): Promise<{ removed: boolean }> {
		const user = await this.getUser(orcid_id);
		if (!this.manages(user, resource_id)) {
			return { removed: false };
		}

		const managersCount = await this.userRepository.count({
			'resources.resource_id': resource_id,
		});
		if (managersCount <= 1) {
			throw new ConflictException(
				`User with ORCID ${orcid_id} is the only manager of resource "${resource_id}", add another manager before removing them.`,
			);
		}

		const updated = await this.userRepository.updateOne(
			{ orcid_id },
			{ $pull: { resources: { resource_id } } },
		);
		this.assertUpdated(updated, orcid_id);

		return { removed: true };
	}

	async listManagers(resource_id: string): Promise<ResourceManagerEntry[]> {
		const managers = await this.userRepository.find(
			{ 'resources.resource_id': resource_id },
			{ orcid_id: 1, displayedName: 1 },
		);

		return managers.map(({ orcid_id, displayedName }) => ({
			orcid_id,
			displayedName,
		}));
	}

	protected async getUser(orcid_id: string) {
		const user = await this.userRepository.findOne({ orcid_id });
		assertIsDefined(
			user,
			`User with ORCID ${orcid_id} not found, only users that already logged in to the platform can manage a resource.`,
			NotFoundException,
		);
		return user;
	}

	protected manages(
		user: { resources?: Array<{ resource_id: string }> },
		resource_id: string,
	): boolean {
		return (user.resources ?? []).some((r) => r.resource_id === resource_id);
	}

	// the repository returns null when the document changed between its read and its write
	protected assertUpdated(updated: unknown, orcid_id: string) {
		if (!updated) {
			throw new ConflictException(
				`User with ORCID ${orcid_id} was modified concurrently, please retry.`,
			);
		}
	}
}
