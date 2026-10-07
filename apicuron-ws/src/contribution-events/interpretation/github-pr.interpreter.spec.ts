const events: any[] = require('./__fixtures__/disprot-events.json');
import { InterpretationError, interpretMergedPullRequest } from './github-pr.interpreter';

const eventFor = (pr: number) => events.find((e) => e.subject === `pull_request/${pr}`);
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