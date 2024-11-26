import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CuratorEntry, CuratorEntryDocument } from 'src/core/schemas/curator-registry/curator-entry.schema';
import { PartnerResourcesService } from 'src/resources/partner-resources/services/partner-resources.service';
import { RegistryEntriesDto } from './dto/registry-entries.dto';
@Injectable()
export class CuratorRegistryService {
	constructor(
		@InjectModel(CuratorEntry.name) protected monthlyStatModel: Model<CuratorEntryDocument>,
		protected resourceService: PartnerResourcesService, 
	){}
	logger = new Logger(CuratorRegistryService.name)

	async getAllEntries(
		query: RegistryEntriesDto,
		filter: FilterQuery<CuratorEntryDocument>
	){
		const {
			filter_field: filter_type,
			query: user_query,
			resources: associated_resources,
		} = query;
		// TODO: To be continued

	}
}
