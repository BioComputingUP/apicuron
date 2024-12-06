import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { UsersService } from '../../auth/users/services/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { FilterQuery, Model } from 'mongoose';
import { SubmitReportDto } from '../dto/submit-report.dto';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { computePrivacyField } from '../../util/privacy.helper';
import {
	hashTermIdentifier,
	ITermIdentifier,
} from '../../terms/helpers/term-hash';
import { League } from '../../core/schemas/league/league.schema';

@Injectable()
export class ReportValidatorService {
	constructor(
		protected resourceService: PartnerResourcesService,
		protected usersService: UsersService,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
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
		// check if the user belongs to a league
		for (const league of resource.leagues) {
			if (league.defaultMembers.includes(report.curator_orcid)) {
				return league;
			}
		}
		// if not, use the default league
		const name = report.league ?? resource.defaultLeague;
		const selectedLeague = resource.leagues.find((l) => l.name === name);
		if (!selectedLeague) {
			throw new BadRequestException(
				`League ${report.league} does not exist for resource ${report.resource_id}`,
			);
		}
		return selectedLeague;
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
		termDoc: TermDocument = null,
	) {
		const { resource_id, activity_term, league } = report;
		const term =
			termDoc ??
			(await this.termModel.findOne({
				resource_id,
				activity_term,
				league,
			}));
		if (!term) {
			throw new BadRequestException(
				`Activity (${activity_term}) does not exist for resource ${resource_id} and league ${league}`,
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
		resourceDoc: PartnerResourceDocument = null,
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
		userDoc: UserDocument = null,
		resourceDoc: PartnerResourceDocument = null,
		termDoc: TermDocument = null,
	): Promise<{
		report: ReportDocument;
		resource: PartnerResourceDocument;
		user: UserDocument;
		term: TermDocument;
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

		const reportDoc = new this.reportModel(report);
		reportDoc.term = term;
		reportDoc.resource = resource;
		reportDoc.user = user;
		reportDoc.league_data = relatedLeague;

		reportDoc.privacy = computePrivacyField(resource, user, report);

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

		const activities: Map<string, ITermIdentifier> = reports.reduce(
			(acc, curr) => {
				const hash = hashTermIdentifier(curr);
				acc.set(hash, {
					resource_id: curr.resource_id,
					activity_term: curr.activity_term,
					league: curr.league,
				});
				return acc;
			},
			new Map<string, ITermIdentifier>(),
		);

		const activitiesFilter: FilterQuery<TermDocument>[] = Array.from(
			activities.values(),
		);

		const resources$ = this.resourceService.get_resources({
			resource_id: { $in: resourceIds },
		});

		const users$ = this.usersService.getUsers({ orcid_id: { $in: orcidIds } });

		const terms$ = this.termModel.find({ $or: activitiesFilter });

		const [resources, users, terms] = await Promise.all([
			resources$,
			users$,
			terms$,
		]);

		const resourcesMap = new Map<string, PartnerResourceDocument>(
			resources.map((r) => [r.resource_id, r]),
		);
		const usersMap = new Map<string, UserDocument>(
			users.map((u) => [u.orcid_id, u]),
		);
		const termsMap = new Map<string, TermDocument>(
			terms.map((t) => [hashTermIdentifier(t), t]),
		);
		const results: {
			resource: PartnerResourceDocument;
			user: UserDocument;
			report: ReportDocument;
			term: TermDocument;
			league_data: League;
		}[] = [];
		for (const [index, report] of reports.entries()) {
			try {
				const result = await this.validateReport(
					report,
					usersMap.get(report.curator_orcid),
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
