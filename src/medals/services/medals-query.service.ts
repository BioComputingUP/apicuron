import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, QueryOptions } from 'mongoose';
import { AchievementState } from '../../core/enums';
import {
	Medal,
	MedalDocument,
} from '../../core/schemas/achievements/medals.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { plainToInstance } from 'class-transformer';
import { MedalDto } from '../dto/medal.dto';

export class MedalsQueryService {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
	) {}

	async getMedals(
		filter: FilterQuery<MedalDocument>,
		options: QueryOptions<MedalDocument>,
	): Promise<{ data: MedalDto[]; count: number }> {
		filter.state = AchievementState.achieved;
		const dataPromise = this.medalModel.find(filter, {}, options);
		const countPromise = this.medalModel.count(filter);

		const [medals, count] = await Promise.all([dataPromise, countPromise]);

		const data = plainToInstance(MedalDto, medals);

		return {
			data,
			count,
		};
	}
}
