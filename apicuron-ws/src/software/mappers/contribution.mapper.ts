import { PRPayloadDto } from '../dto/pr_payload.dto';
import { SoftwareContribution } from '../types/contribution';

export function mapPRPayloadToContributions(
	dto: PRPayloadDto,
): SoftwareContribution[] {
	const contributions: SoftwareContribution[] = [];

	if (dto.github_login) {
		const activity_term = resolveAuthorActivityTerm(dto.context.labels);
		if (activity_term) {
			contributions.push({
				github_login: dto.github_login,
				activity_term: activity_term,
				contribution_id: dto.contribution_id,
				resource_id: dto.resource_id,
				entity_uri: dto.context.pr_url,
				timestamp: new Date(dto.timestamp),
			});
		}

		for (const reviewerLogin of dto.context.reviewers) {
			contributions.push({
				github_login: reviewerLogin,
				activity_term: 'generic_review_activity',
				contribution_id: dto.contribution_id,
				resource_id: dto.resource_id,
				entity_uri: dto.context.pr_url,
				timestamp: new Date(dto.timestamp),
			});
		}
	}
	return contributions;
}

function resolveAuthorActivityTerm(labels: string[]): string | null {
	if (labels.length === 0) return 'generic_pr_activity';
	for (const label of labels) {
		const lower_case_label = label.toLocaleLowerCase();
		if (lower_case_label.includes('bug')) return 'bug_fixing_activity';
		if (lower_case_label.includes('enhancement')) return 'development_activity';
		if (lower_case_label.includes('documentation'))
			return 'documentation_activity';
		if (lower_case_label.includes('test')) return 'testing_activity';
		if (
			lower_case_label.includes('chore') ||
			lower_case_label.includes('refactor')
		)
			return 'chore_activity';

		if (
			lower_case_label.includes('duplicate') ||
			lower_case_label.includes('invalid')
		)
			return null;
	}
	return 'generic_pr_activity';
}
