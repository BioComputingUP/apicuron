import { Injectable } from '@nestjs/common';
import { AggregatorClass } from 'src/event-orchestrator/decorators/aggregator.decorator';
import { Aggregator } from 'src/event-orchestrator/interfaces/aggregator.interface';
import { LeanReportDocument, ReportDocument } from 'src/core/schemas/reports.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PartnerResourceDocument } from 'src/core/schemas/resource/partner-resource.schema';
import { TermDocument } from 'src/core/schemas/terms.schema';
import { UserDocument } from 'src/core/schemas/user.schema';
import { PrivacyType } from 'src/core/enums';
import { LeagueUpdatedEvent } from 'src/resources/partner-resources/leagues/events/league-updated.event';
import { PartnerResourcesService } from 'src/resources/partner-resources/services/partner-resources.service';
import { UsersService } from '../../services/users.service';
import { Report } from 'src/core/schemas/reports.schema';
@Injectable()
@AggregatorClass()
export class UserResourceAggregatorService implements Aggregator{

	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		

		// protected resourceService: PartnerResourcesService,
		protected usersService: UsersService,
	){
		// maybe update all users here?
	}

	applyReport(report: LeanReportDocument | ReportDocument, term: TermDocument, resource: PartnerResourceDocument, curator?: UserDocument) {
		// On new report, check if the associated user has the resource attached to them, if not attach it
		// Also attach the league if not associated

	}
	applyAllReports(resource_id: string) {
		//idk yet 
	}
	removeAllResourceAggregates(resource_id: string) {
		//idk yet
	}
	updateUserPrivacy(curator_orcid: string, privacy: PrivacyType) {
		// do it
		return;
	}
	deleteLeague(resource_id: string, league: string): Promise<number> | number {
		// Check for all users in the league and remove it??
		return;
	}
	updatedLeague(leagueUpdated: LeagueUpdatedEvent): Promise<number> | number {
		// Add league to added users, remove league from removed users and if league privacy changed
		return;
	}
	recomputeAllResourceAggregates(resource_id: string) {
		//idk probably nothing
	}
	termUpdated(oldTerm: TermDocument, term: TermDocument) {
		//shouldn't affect
		return;
	}
	termDeleted(term: TermDocument) {
		// shouldn't affect
		return;
	}

}
