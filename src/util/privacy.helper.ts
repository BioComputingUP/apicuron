import { FilterQuery, LeanDocument } from 'mongoose';
import { PrivacyType } from '../core/enums';
import { ResourceEntityDocument } from '../core/schemas/components/resource-entity.schema';
import {
	UserResourceEntity,
	UserResourceEntityDocument,
} from '../core/schemas/components/user-resource-entity.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../core/schemas/resource/partner-resource.schema';
import { User, UserDocument } from '../core/schemas/user.schema';

/**
 * Computes the privacy field for a given resource entity based on the resource, related user, and user resource entity.
 * If either the league privacy or the user privacy is set to private, the privacy type of the entity will be private.
 * Otherwise, it will be public.
 * @param resource - The resource document or lean document.
 * @param relatedUser - The related user document or lean document, or null.
 * @param userResourceEntity - The user resource entity document or lean document.
 * @returns The privacy type of the user resource entity.
 */
export function computePrivacyField(
	resource: PartnerResourceDocument | LeanDocument<PartnerResource>,
	relatedUser: UserDocument | LeanDocument<User> | null,
	userResourceEntity:
		| LeanDocument<UserResourceEntity>
		| UserResourceEntityDocument
		| { league?: string; privacy?: PrivacyType },
): PrivacyType {
	// if the resourceEntity has a specified league we use it otherwise we use the resource's default league
	const league = userResourceEntity.league ?? resource.defaultLeague;

	// we retrieve both the league's privacy and the user's privacy setting
	const leaguePrivacy = resource.getLeague(league).visibility;
	const userPrivacy = relatedUser?.privacy ?? PrivacyType.private;

	// if one of them happens to be private, the privacyType of the entity will be private
	if ([leaguePrivacy, userPrivacy].includes(PrivacyType.private)) {
		userResourceEntity.privacy = PrivacyType.private;
	} else {
		userResourceEntity.privacy = PrivacyType.public;
	}

	return userResourceEntity.privacy;
}

// @deprecated
/**
 * Assigns the privacy field of a resource entity based on the provided resource and resource entity.
 * @deprecated This function is deprecated and will be removed in future versions. Please Do not use it
 * @param resource - The resource object.
 * @param resourceEntity - The resource entity object.
 * @returns The privacy type assigned to the resource entity.
 */
export function assignPrivacyField(
	resource: PartnerResourceDocument | LeanDocument<PartnerResource>,
	resourceEntity: LeanDocument<UserResourceEntity> | UserResourceEntityDocument,
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
