import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, LeanDocument, Model } from 'mongoose';
import { assertNotNull } from 'src/util/type-assertion.helper';
import { UsersService } from '../../auth/users/services/users.service';
import {
	League,
	LeagueDocument,
} from '../../core/schemas/league/league.schema';
import {
	ReportModel,
	ReportDocument,
	Report,
} from '../../core/schemas/reports.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import {
	hashTermIdentifier,
	ITermIdentifier,
} from '../../terms/helpers/term-hash';
import { computePrivacyField } from '../../util/privacy.helper';
import { SubmitReportDto } from '../dto/submit-report.dto';

@Injectable()
export class ReportValidatorService {
	constructor(
		protected resourceService: PartnerResourcesService,
		protected usersService: UsersService,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		@InjectModel(Report.name) protected reportModel: ReportModel,
	) {}

	logger = new Logger(ReportValidatorService.name);

	/**
	 * Assigns a default league to the given report based on the user's membership in a league or using the default league of the resource.
	 *
	 * @param report - The report to assign a default league to.
	 * @param resource - The partner resource document containing the leagues and default league.
	 * @returns The name of the assigned default league.
	 */
	private assignDefaultLeague(
		report: SubmitReportDto,
		resource: PartnerResourceDocument,
	): League {
		if (!!report.league) {
			const selectedLeague = resource.leagues.find(
				(l) => l.name === report.league,
			);
			if (!selectedLeague) {
				throw new BadRequestException(
					`League ${report.league} does not exist for resource ${report.resource_id}`,
				);
			}
			return selectedLeague.toObject();
		}
		// check if the user belongs to a league
		for (const league of resource.leagues) {
			if (league.defaultMembers.includes(report.curator_orcid)) {
				return league.toObject();
			}
		}
		// if not, use the default league
		const name = resource.defaultLeague;
		const selectedLeague = resource.leagues.find((l) => l.name === name);
		if (!selectedLeague) {
			throw new BadRequestException(
				`League ${report.league} does not exist for resource ${report.resource_id}`,
			);
		}
		return selectedLeague.toObject();
	}

	/**
	 * Validates the activity term of a report.
	 *
	 * @param report - The report to be validated.
	 * @param termDoc - The term document to be used for validation. If not provided, it will be fetched from the database.
	 * @returns An object containing the validated report and the corresponding term.
	 * @throws BadRequestException if the activity term does not exist for the given resource and league.
	 */
	async validateReportActivityTerm(
		report: SubmitReportDto,
		termDoc: Term | null = null,
	) {
		const { resource_id, activity_term } = report;
		const term =
			termDoc ??
			(await this.termModel.findOne({
				resource_id,
				activity_term,
			}));
		if (!term) {
			throw new BadRequestException(
				`Activity (${activity_term}) does not exist for resource ${resource_id}.`,
			);
		}
		return { report, term };
	}

	/**
	 * Validates a report resource.
	 *
	 * @param report - The report to be validated.
	 * @param resourceDoc - The partner resource document. If not provided, it will be fetched from the database.
	 * @throws BadRequestException if the resource does not exist.
	 */
	async validateReportResource(
		report: SubmitReportDto,
		resourceDoc: PartnerResourceDocument | null = null,
	) {
		// validate the resource_id
		const resource =
			resourceDoc ??
			(await this.resourceService.get_resource(report.resource_id));

		if (!resource || resource.resource_id != report.resource_id) {
			throw new BadRequestException(
				`You either do not have the authorization to perform CRUD operation on the reports of the (${report.resource_id}) resource or the resource does not exist`,
			);
		}
		return { report, resource };
	}

	/**
	 * Validates a report.
	 *
	 * @param report - The report to validate.
	 * @param userDoc - The user document, (optional). otherwise it will be fetched from the database.
	 * @param resourceDoc - The partner resource document, (optional).otherwise it will be fetched from the database.
	 * @param termDoc - The term document, to be used for validation, (optional) otherwise it will be fetched from the database.
	 * @returns An object containing the validated report, resource, user, and term documents.
	 * @throws BadRequestException if the resource or league does not exist.
	 */
	async validateReport(
		report: SubmitReportDto,
		userDoc: User | null = null,
		resourceDoc: PartnerResourceDocument | null = null,
		termDoc: Term | null = null,
	): Promise<{
		report: Report;
		resource: PartnerResourceDocument;
		user: User;
		term: Term;
		league_data: League;
	}> {
		// validate the resource_id
		const { resource } = await this.validateReportResource(report, resourceDoc);

		// validate the league
		const relatedLeague = this.assignDefaultLeague(report, resource);
		report.league = relatedLeague.name;

		// validate the activity term
		const { term } = await this.validateReportActivityTerm(report, termDoc);

		const user =
			userDoc ?? (await this.usersService.getByOrcid(report.curator_orcid));

		const reportDoc = new this.reportModel<Report>({
			...report,
			term,
			resource,
			league_data: relatedLeague,
			user: user,
			privacy: computePrivacyField(resource, user, report),
		});

		return {
			report: reportDoc,
			resource,
			term,
			user,
			league_data: relatedLeague,
		};
	}

	async validateReports(reports: SubmitReportDto[]) {
		const resourceIds = Array.from(new Set(reports.map((r) => r.resource_id)));
		const orcidIds = Array.from(new Set(reports.map((r) => r.curator_orcid)));

		// obtain a map of resources based on the resource_ids
		const resourcesMap = (
			await this.resourceService.get_resources({
				resource_id: { $in: resourceIds },
			})
		).reduce(
			(
				acc: Map<string, PartnerResourceDocument>,
				curr: PartnerResourceDocument,
			) => acc.set(curr.resource_id, curr),
			new Map<string, PartnerResourceDocument>(),
		);

		// obtain a map of activities based on the activity terms/league/resource_id
		const activities: Map<string, ITermIdentifier> = reports
			// populate the league field of the report
			.map((report) => {
				const resource_from_report = resourcesMap.get(report.resource_id);
				assertNotNull(resource_from_report, 'Resource not found');
				report.league = this.assignDefaultLeague(
					report,
					resource_from_report,
				).name;
				return report;
			})
			.reduce((acc, curr) => {
				const hash = hashTermIdentifier(curr);
				acc.set(hash, {
					resource_id: curr.resource_id,
					activity_term: curr.activity_term,
					league: curr.league, // Assign the default league using the resource object from the report
				});
				return acc;
			}, new Map<string, ITermIdentifier>());

		const activitiesFilter: FilterQuery<TermDocument>[] = Array.from(
			activities.values(),
		);

		const users$ = this.usersService.getUsers({ orcid_id: { $in: orcidIds } });

		const terms$ = this.termModel.find({ $or: activitiesFilter });

		const [users, terms] = await Promise.all([users$, terms$]);

		const usersMap = new Map<string, User>(users.map((u) => [u.orcid_id, u]));
		const termsMap = new Map<string, TermDocument>(
			terms.map((t) => [hashTermIdentifier(t), t]),
		);
		const results: {
			resource: PartnerResourceDocument;
			user: User;
			report: Report;
			term: Term;
			league_data: League;
		}[] = [];
		for (const [index, report] of reports.entries()) {
			try {
				const result = await this.validateReport(
					report,
					usersMap.get(report.curator_orcid) ?? null,
					resourcesMap.get(report.resource_id),
					termsMap.get(hashTermIdentifier(report)),
				);
				results.push(result);
			} catch (err) {
				if (err instanceof BadRequestException) {
					err.message = `Error at index ${index}: ${err.message}`;
					throw err;
				}
			}
		}
		return results;
	}
}
