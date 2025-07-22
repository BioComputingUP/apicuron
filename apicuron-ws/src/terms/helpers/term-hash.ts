import * as crypto from 'crypto';

export interface ITermIdentifier {
	resource_id: string;
	activity_term: string;
	league: string;
}

/**
 * Generates a very simple hash for a term.
 *
 * @param {Object} params - The parameters for generating the hash.
 * @param {string} params.resource_id - The resource ID.
 * @param {string} params.activity_term - The activity term.
 * @param {string} params.league - The league.
 * @returns {string} The generated hash.
 */
export function hashTermIdentifier({
	resource_id,
	activity_term,
	league,
}: ITermIdentifier): string {
	const resourceIdHash = crypto
		.createHash('sha256')
		.update(resource_id)
		.digest('hex');
	const activityTermHash = crypto
		.createHash('sha256')
		.update(activity_term)
		.digest('hex');
	const leagueHash = crypto.createHash('sha256').update(league).digest('hex');

	return resourceIdHash + activityTermHash + leagueHash;
}
