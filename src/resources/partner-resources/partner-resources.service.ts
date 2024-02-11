import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
// import { TransformerService } from '../../shared/transformer/transformer.service';
import { UpdatePartnerResourceDto } from '../dto/updateResource.dto';
import { OnEvent } from '@nestjs/event-emitter';
import {
	PRE_REPORT_INSERT,
	PRE_REPORT_INSERT_MANY,
} from '../../reports/constants';
import { ReportDocument } from '../../core/schemas/reports.schema';

@Injectable()
export class PartnerResourcesService {
	constructor(
		@InjectModel(PartnerResource.name)
		private partnerResourceModel: Model<PartnerResourceDocument>, // protected transformService: TransformerService
	) {}
	async get_resources(
		filter: FilterQuery<PartnerResourceDocument> = {},
	): Promise<PartnerResourceDocument[]> {
		return await this.partnerResourceModel.find(filter);
	}

	async count() {
		return await this.partnerResourceModel.count();
	}

	async retrieve_uri(resource_id: string) {
		const resource = await this.partnerResourceModel.findOne({ resource_id });
		if (!resource) {
			// this.transformService.warn('resource_id', `Incorrect resource_id: ${resource_id} Not found, parameter ignored`)
			return null;
		} else {
			return resource.resource_uri;
		}
	}

	async get_resource(resource_id: string): Promise<PartnerResourceDocument> {
		return await this.partnerResourceModel.findOne({ resource_id });
	}

	async exists(resource_id: string): Promise<boolean> {
		return !!(await this.partnerResourceModel.exists({ resource_id }));
	}

	async update_resource(
		resource_update: UpdatePartnerResourceDto & { logo?: string },
	) {
		const { resource_id } = resource_update;

		return await this.partnerResourceModel.updateOne(
			{ resource_id },
			resource_update,
		);
	}

	@OnEvent(PRE_REPORT_INSERT, { async: true, promisify: true })
	async onReportInsert(report: ReportDocument) {
		if (report.league) {
			return;
		}
		const resource = await this.get_resource(report.resource_id);
		report.league = resource.defaultLeague;
		return;
	}

	@OnEvent(PRE_REPORT_INSERT_MANY, { async: true, promisify: true })
	async preReportInsertMany(reports: ReportDocument[]) {
		const resource_ids = new Set(reports.map((report) => report.resource_id));
		const resources = await this.partnerResourceModel.find({
			resource_id: { $in: Array.from(resource_ids) },
		});

		const resourceMap = new Map(
			resources.map((resource) => [resource.resource_id, resource]),
		);

		for (const report of reports) {
			if (report.league) {
				continue;
			}
			const resource = resourceMap.get(report.resource_id);
			if (!resource) {
				throw new UnprocessableEntityException(
					`Resource with id ${report.resource_id} does not exist`,
				);
			}
			report.league = resource.getLeague(resource.defaultLeague).name;
		}

		return;
	}
}
