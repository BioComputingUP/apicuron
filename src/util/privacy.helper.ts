import { FilterQuery, HydratedDocument, LeanDocument } from 'mongoose';
import { PrivacyType } from '../core/enums';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../core/schemas/resource/partner-resource.schema';
import { User, UserDocument } from '../core/schemas/user.schema';
import {
	IResourceEntityDocument,
	IUserResourceEntity,
	IUserResourceEntityDocument,
	LeanIResourceEntityDocument,
} from '../core/interfaces/user-resource-entity';

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
		| LeanDocument<IUserResourceEntity>
		| HydratedDocument<IUserResourceEntity>
		| { league?: string; privacy?: PrivacyType },
): PrivacyType {
	// if the resourceEntity has a specified league we use it otherwise we use the resource's default league
	const league = userResourceEntity.league ?? resource.defaultLeague;
	userResourceEntity.league = league;

	// we retrieve both the league's privacy and the user's privacy setting
	const leaguePrivacy = resource.getLeague(league).visibility;
	const userPrivacy = relatedUser?.privacy ?? PrivacyType.private;

	console.log('leaguePrivacy', leaguePrivacy);
	console.log('userPrivacy', userPrivacy);

	// if one of them happens to be private, the privacyType of the entity will be private
	if ([leaguePrivacy, userPrivacy].includes(PrivacyType.private)) {
		userResourceEntity.privacy = PrivacyType.private;
	} else {
		userResourceEntity.privacy = PrivacyType.public;
	}

	return userResourceEntity.privacy;
}

/**
 * Computes the privacy field of an aggregated entity based on the privacy of a resource entity and a report.
 * E.G: if I process a badge using a badgedef and a report, the report contains the privacy value of the user/resource
 * And the badgedef contains the privacy value of the resource. Therefore combining this method would combine the two
 * If either the resource entity or the report has a privacy type of "private", the aggregate privacy will be "private".
 * Otherwise, the aggregate privacy will be "public".
 *
 * @param resourceEntity - The resource entity object.
 * @param report - The report object.
 * @returns The aggregate privacy type.
 */
export function computeAggregatePrivacyField(
	resourceEntity: { privacy: PrivacyType },
	report: { privacy: PrivacyType },
) {
	return [resourceEntity.privacy, report.privacy].includes(PrivacyType.private)
		? PrivacyType.private
		: PrivacyType.public;
}

/**
 * Assigns the privacy field of a resource entity based on the provided resource and resource entity.
 * @param resource - The resource object.
 * @param resourceEntity - The resource entity object.
 * @returns The privacy type assigned to the resource entity.
 */
export function assignResourceEntityPrivacy(
	resource: PartnerResourceDocument | LeanDocument<PartnerResource>,
	resourceEntity: LeanIResourceEntityDocument | IResourceEntityDocument,
): PrivacyType {
	const league = resourceEntity.league ?? resource.defaultLeague;
	resourceEntity.league = league;
	resourceEntity.privacy = resource.getLeague(league).visibility;
	return resourceEntity.privacy;
}

/**
 * Assigns the privacy value to a resource entity. Any item that is exclusively defined by the resource
 * E.G: A badge definition, an activity type (term), etc. will have its privacy value set to the resource's corresponding league
 * @param requestUser The user making the request.
 * @returns The filterQuery to apply to any resource entity to only allow public entities and private entities to the ones owned by the user.
 */
export function resourceEntityPrivacyFilter(
	requestUser: User | null,
): FilterQuery<IResourceEntityDocument> {
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
): FilterQuery<IUserResourceEntityDocument> {
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
