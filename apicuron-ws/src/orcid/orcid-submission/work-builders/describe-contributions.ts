export interface CreditedActivity {
	activity_term: string;
	activity_name: string;
	count: number;
}

export interface ContributionSummary {
	resourceName: string;
	firstContribution: Date;
	lastContribution: Date;
	/** used when no per-activity counts are available */
	totalCount: number;
	activities: CreditedActivity[];
}

const MAX_NAMED_ACTIVITIES = 3;

function plural(count: number, singular: string, pluralForm: string): string {
	return `${count} ${count === 1 ? singular : pluralForm}`;
}

function period(first: Date, last: Date): string {
	const firstYear = new Date(first).getUTCFullYear();
	const lastYear = new Date(last).getUTCFullYear();
	return firstYear === lastYear
		? `In ${firstYear}`
		: `Between ${firstYear} and ${lastYear}`;
}

function joinWithAnd(items: string[]): string {
	if (items.length <= 1) return items.join('');
	return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Adds up counts of the same activity, most frequent first, with tidied labels. */
export function mergeActivities(
	activities: CreditedActivity[],
): CreditedActivity[] {
	const byTerm = new Map<string, CreditedActivity>();
	for (const activity of activities) {
		const existing = byTerm.get(activity.activity_term);
		if (existing) {
			existing.count += activity.count;
		} else {
			byTerm.set(activity.activity_term, {
				...activity,
				// labels are written by each resource, e.g. "Region  revised"
				activity_name: activity.activity_name.replace(/\s+/g, ' ').trim(),
			});
		}
	}
	return [...byTerm.values()]
		.filter((activity) => activity.count > 0)
		.sort(
			(a, b) =>
				b.count - a.count || a.activity_name.localeCompare(b.activity_name),
		);
}

/**
 * Writes a short narrative of what a person was credited for on a resource, e.g.
 * "Between 2024 and 2026, credited on APICURON for 14 contributions to DisProt software,
 * most often in Change Reviewing (5), Bug Fixing (4) and Feature Building (3),
 * plus 2 contributions in 2 other activities."
 * Activity labels come from the resource's own activity definitions.
 */
export function describeContributions(summary: ContributionSummary): string {
	const activities = mergeActivities(summary.activities);
	const total =
		activities.length > 0
			? activities.reduce((sum, activity) => sum + activity.count, 0)
			: summary.totalCount;

	const opening = `${period(
		summary.firstContribution,
		summary.lastContribution,
	)}, credited on APICURON for ${plural(
		total,
		'contribution',
		'contributions',
	)} to ${summary.resourceName}`;

	if (activities.length === 0) {
		return `${opening}.`;
	}
	if (activities.length === 1) {
		return `${opening}, all in ${activities[0].activity_name}.`;
	}

	const named = activities.slice(0, MAX_NAMED_ACTIVITIES);
	const rest = activities.slice(MAX_NAMED_ACTIVITIES);
	const namedText = joinWithAnd(
		named.map((activity) => `${activity.activity_name} (${activity.count})`),
	);

	if (rest.length === 0) {
		return `${opening}, in ${namedText}.`;
	}
	const restCount = rest.reduce((sum, activity) => sum + activity.count, 0);
	// "most often" stays true even when the named activities are less than half of the total
	return `${opening}, most often in ${namedText}, plus ${plural(
		restCount,
		'contribution',
		'contributions',
	)} in ${plural(rest.length, 'other activity', 'other activities')}.`;
}
