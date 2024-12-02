import { Injectable, Logger } from '@nestjs/common';
import { AggregatorClass } from 'src/event-orchestrator/decorators/aggregator.decorator';
import { Aggregator } from 'src/event-orchestrator/interfaces/aggregator.interface';
import { ReportDocument, LeanReportDocument } from 'src/core/schemas/reports.schema';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TermDocument } from 'src/core/schemas/terms.schema';
import { UserDocument } from 'src/core/schemas/user.schema';
import { PrivacyType } from 'src/core/enums';
import { LeagueUpdatedEvent } from 'src/resources/partner-resources/leagues/events/league-updated.event';
import { Report } from 'src/core/schemas/reports.schema';

import { EntityCreatedEvent, EntityUpdatedEvent } from 'src/core/events';
import { UserRepository } from 'src/core/repositories/user.repository';
import { CuratorRegistryEntry, CuratorRegistryEntryDocument } from 'src/core/schemas/curator-registry/curator-entry.schema';

import { CuratorRegistryService } from '../curator-registry.service';


@Injectable()
@AggregatorClass()
export class CuratorRegistryAggregatorService implements Aggregator{

	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		// @InjectModel(CuratorRegistryEntry.name) protected curatorEntryModel: Model<CuratorRegistryEntryDocument>,
		protected registryService: CuratorRegistryService,

		// protected resourceService: PartnerResourcesService,
		protected userRep: UserRepository,
	){}
	private logger = new Logger(CuratorRegistryAggregatorService.name)
	async applyReport(report: LeanReportDocument | ReportDocument) {


		// const curatorFilter: FilterQuery<CuratorRegistryEntryDocument> = {
		// 	curator_orcid : report.curator_orcid,
			// contributed_to : {$eleMatch: {resource_id: report.resource_id}}
		// }

		// const curator = await this.curatorEntryModel.findOne(curatorFilter)

		// if(!!curator){
			
		// }
		


	}
	updatedUser(event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>) {
		if (event instanceof EntityCreatedEvent) {
			this.logger.debug(`[User Created Event] adding curator ${event.instance.orcid_id}`);
			this.registryService.addCurator(event.instance);
		}
		if (event instanceof EntityUpdatedEvent) {
			this.logger.debug(`[User Updated Event] updating curator ${event.after.orcid_id}`);
			this.registryService.updateCurator(event.after);
			this.logger.debug(`user updated`);
		}
		return; 
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
		
		return;
	}

}

