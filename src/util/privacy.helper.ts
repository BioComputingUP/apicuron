import { FilterQuery } from 'mongoose';
import { PrivacyType } from '../core/enums';
import {
	ResourceEntity,
	ResourceEntityDocument,
} from '../core/schemas/components/resource-entity.schema';
import { UserResourceEntityDocument } from '../core/schemas/components/user-resource-entity.schema';
import { PartnerResourceDocument } from '../core/schemas/resource/partner-resource.schema';
import { User, UserDocument } from '../core/schemas/user.schema';
import { ResourceDocument } from '../core/schemas/resource/resource.schema';

export function computePrivacyField(
	resource: PartnerResourceDocument,
	relatedUser: UserDocument | null,
	resourceEntity: UserResourceEntityDocument,
): PrivacyType {
	// if the resourceEntity has a specified league we use it otherwise we use the resource's default league
	const league = resourceEntity.league ?? resource.defaultLeague;

	// we retrieve both the league's privacy and the user's privacy setting
	const leaguePrivacy = resource.getLeague(league).visibility;
	const userPrivacy = relatedUser?.privacy ?? PrivacyType.private;

	// if one of them happens to be private, the privacyType of the entity will be private
	if ([leaguePrivacy, userPrivacy].includes(PrivacyType.private)) {
		resourceEntity.privacy = PrivacyType.private;
	} else {
		resourceEntity.privacy = PrivacyType.public;
	}

	return resourceEntity.privacy;
}

export function assignPrivacyField(
	resource: PartnerResourceDocument,
	resourceEntity: ResourceEntityDocument,
): PrivacyType {
	const league = resourceEntity.league ?? resource.defaultLeague;
	resourceEntity.privacy = resource.getLeague(league).visibility;
	return resourceEntity.privacy;
}

export function resourceEntityPrivacyFilter(
	requestUser: User | null,
): FilterQuery<ResourceEntityDocument> {
	if (!requestUser || requestUser == null) {
		return { privacy: PrivacyType.public };
	}
	const allowedResources = requestUser.resources.map((r) => r.resource_id);
	return {
		$or: [
			{ resource_id: { $in: allowedResources } },
			{
				privacy: PrivacyType.public,
			},
		],
	};
}

export function userResourceEntityPrivacyFilter(
	requestUser: User | null,
): FilterQuery<UserResourceEntityDocument> {
	if (!requestUser || requestUser == null) {
		return { privacy: PrivacyType.public };
	}
	return {
		$or: [
			resourceEntityPrivacyFilter(requestUser),
			{
				$or: [
					{ curator_orcid: requestUser.orcid_id },
					{ privacy: PrivacyType.public },
				],
			},
		],
	};
}
