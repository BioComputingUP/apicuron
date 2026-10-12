const events: any[] = require('./__fixtures__/disprot-events.json');
import { InterpretationError, interpretMergedPullRequest } from './github-pr.interpreter';

const eventFor = (pr: number) => events.find((e) => e.subject === `pull_request/${pr}`);
const authorIdOf = (event: any) => event.data.activities.find((a: any) => a.kind === 'opened')?.account?.id;
const summarize = (payload: unknown) =>
	interpretMergedPullRequest(payload).map((r) => `${r.github_login}:${r.activity_term}`);

describe('interpretMergedPullRequest', () => {
	it.each([
		[115, ['adelbke:change_integration', 'adelbke:change_reviewing', 'adelbke:technical_discussion', 'geekn0rd:feature_building']],
		[120, ['adelbke:bug_fixing']],
		[93, ['adelbke:change_integration', 'adelbke:change_reviewing', 'geekn0rd:bug_fixing']],
		[101, ['adelbke:change_integration', 'adelbke:technical_discussion', 'geekn0rd:change_shipped']],
		[10, ['adelbke:change_integration', 'geekn0rd:feature_building']],
		[8, ['geekn0rd:technical_discussion', 'adelbke:change_shipped']],
		[2, ['adelbke:change_integration', 'adelbke:change_reviewing', 'geekn0rd:bug_fixing']],
		[87, ['adelbke:change_integration', 'adelbke:change_reviewing', 'adelbke:technical_discussion', 'geekn0rd:bug_fixing']],
	])('reference case PR #%i', (pr, expected) => {
		expect(summarize(eventFor(pr)).sort()).toEqual([...expected].sort());
	});

	it.each([
		[120, 'pr_label'],
		[2, 'pr_label'],
		[115, 'issue_label'],
		[93, 'issue_label'],
		[101, 'none'],
	])('type_source of the authored credit for PR #%i is %s', (pr, expected) => {
		const event = eventFor(pr);
		const authored = interpretMergedPullRequest(event).filter((r) => r.type_source !== undefined);
		expect(authored).toHaveLength(1);
		expect(authored[0].github_id).toBe(authorIdOf(event));
		expect(authored[0].type_source).toBe(expected);
	});

	it('sets type_source only on authored reports', () => {
		for (const event of events) {
			const authorId = authorIdOf(event);
			const reports = interpretMergedPullRequest(event);
			const typed = reports.filter((r) => 'type_source' in r);
			expect(typed).toHaveLength(authorId ? 1 : 0);
			for (const report of typed) {
				expect(report.github_id).toBe(authorId);
				expect(['change_reviewing', 'technical_discussion', 'change_integration']).not.toContain(
					report.activity_term,
				);
			}
		}
	});

	it('throws when required fields are missing', () => {
		expect(() => interpretMergedPullRequest({})).toThrow(InterpretationError);
	});

	it('matches the recorded baseline for all fixture events', () => {
        // If the changes are intended, bump INTERPRETER_VERSION and update the snapshot with npx jest -u.
		const baseline = events
			.map((e) => ({ pr: e.subject, reports: summarize(e) }))
			.sort((a, b) => a.pr.localeCompare(b.pr));
		expect(baseline).toMatchSnapshot();
	});
});