import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery, QueryOptions } from "mongoose";
import { AchievementState } from "../../core/enums";
import { Medal, MedalDocument } from "../../core/schemas/achievements/medals.schema";
import { PartnerResourcesService } from "../../resources/partner-resources/services/partner-resources.service";


export class MedalsQueryService {

	constructor(
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
	) {}

	async getMedals(
		filter: FilterQuery<MedalDocument>,
		options: QueryOptions<MedalDocument>,
	): Promise<{ data: MedalDocument[]; count: number }> {
		filter.state = AchievementState.achieved;
		const dataPromise = this.medalModel.find(filter, {}, options);
		const countPromise = this.medalModel.count(filter);

		const [data, count] = await Promise.all([dataPromise, countPromise]);
		return {
			data,
			count,
		};
	}
}