export const INTERPRETER_VERSION = 'github-pr-roles@1';
export const GITHUB_PR_MERGED_TYPE = 'it.unipd.biocomputingup.github.pull_request.merged';

export class InterpretationError extends Error {}

// generic structure for the report, TODO: orcid to be resolved 
export interface IntendedReport {
	github_id: string;
	github_login: string;
	activity_term: string;
	timestamp: Date;
	entity_uri: string;
}

type Account = { id: string; login: string };
type Activity = {
	kind: string;
	account?: Account;
	object_id?: string;
	channel?: string;
	review_object_id?: string;
};

// hard-coded terms for the activities for now.
const TERMS = {
	untyped: 'change_shipped',
	reviewed: 'change_reviewing',
	discussed: 'technical_discussion',
	merged: 'change_integration',
};

// label to activity mapping, order matters cuz bug+feature should be bug_fixing for example
const TYPE_RULES = [
	{ term: 'documentation_writing', patterns: ['doc'] },
	{ term: 'test_writing', patterns: ['test'] },
	{ term: 'bug_fixing', patterns: ['bug', 'fix'] },
	{ term: 'feature_building', patterns: ['enhancement', 'feature'] },
	{ term: 'codebase_maintenance', patterns: ['chore', 'refactor'] },
];

function typeTermFromLabels(labels: string[]): string | null {
	const lowered = labels.map((label) => label.toLowerCase());
	for (const rule of TYPE_RULES) {
		if (lowered.some((label) => rule.patterns.some((pattern) => label.includes(pattern)))) {
			return rule.term; // first match wins
		}
	}
	return null;
}

export function interpretMergedPullRequest(payload: any): IntendedReport[] {
	const pr = payload?.data?.pull_request;
	const activities: Activity[] = payload?.data?.activities;
	if (!pr?.url || !pr?.closed_at || !Array.isArray(activities)) {
		throw new InterpretationError('Event is missing pull_request.url, pull_request.closed_at or activities');
	}

	const timestamp = new Date(pr.closed_at);
	const reports = new Map<string, IntendedReport>(); // key: term + account to avoid duplicates
	const credit = (account: Account | undefined, activity_term: string) => {
		if (!account?.id) return;
		const key = `${activity_term}|${account.id}`;
		if (!reports.has(key)) {
			reports.set(key, {
				github_id: account.id,
				github_login: account.login,
				activity_term,
				timestamp,
				entity_uri: pr.url,
			});
		}
	};

	const author = activities.find((a) => a.kind === 'opened')?.account;
	const isAuthor = (account?: Account) => !!author && account?.id === author.id;

    // crediting rules: Author gets credit from PR labels, closed issues labels or the generic untyped one, in this order, once per pr
	if (author) {
		const closingIssueLabels: string[] = (payload.data.relationships ?? []).flatMap(
			(r: any) => r?.target?.labels ?? [],
		);
		const term =
			typeTermFromLabels(pr.labels ?? []) ?? typeTermFromLabels(closingIssueLabels) ?? TERMS.untyped;
		credit(author, term);
	}

	// Reviewers: once each, author excluded. 
	const reviewOwner = new Map<string, string | undefined>(); // useful later to exclude reviewers from commenters
	for (const review of activities.filter((a) => a.kind === 'reviewed')) {
		if (review.object_id) reviewOwner.set(review.object_id, review.account?.id);
		if (!isAuthor(review.account)) credit(review.account, TERMS.reviewed);
	}

	// Discussion: once each, author excluded. A comment inside the commenter's own review is reviewing.
	for (const comment of activities.filter((a) => a.kind === 'commented')) {
		if (isAuthor(comment.account)) continue;
		const insideOwnReview =
			comment.channel === 'review_thread' &&
			(!comment.review_object_id || reviewOwner.get(comment.review_object_id) === comment.account?.id);
		if (!insideOwnReview) credit(comment.account, TERMS.discussed);
	}

	// Merger: no credit for merging one's own PR
	const merger = activities.find((a) => a.kind === 'merged')?.account;
	if (!isAuthor(merger)) credit(merger, TERMS.merged);

    // sorting for determinism
	return [...reports.values()].sort(
		(a, b) => a.activity_term.localeCompare(b.activity_term) || a.github_id.localeCompare(b.github_id),
	);
}