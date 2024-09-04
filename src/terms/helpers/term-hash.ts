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
}: {
	resource_id: string;
	activity_term: string;
	league: string;
}) {
	return `${resource_id}::${activity_term}::${league}`;
}

/**
 * Converts a hashed term string into its corresponding object representation.
 *
 * @param hash - The hashed term string to be converted.
 * @returns An object containing the properties `resource_id`, `activity_term`, and `league`.
 */
export function unHashTermIdentifier(hash: string): {
	resource_id: string;
	activity_term: string;
	league: string;
} {
	const [resource_id, activity_term, league] = hash.split('::');
	return {
		resource_id,
		activity_term,
		league,
	};
}
