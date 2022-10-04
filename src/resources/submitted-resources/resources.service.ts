import {
	Injectable,
	NotImplementedException,
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { rename } from 'fs';
import { Model } from 'mongoose';
import path from 'path';
import { TransformerService } from '../../shared/transformer/transformer.service';
import { createResourceDto } from '../dto/createResource.dto';
import {
	SubmittedResource,
	SubmittedResourceDocument,
} from '../schemas/submitted-resource.schema';

@Injectable()
export class SubmittedResourcesService {
	constructor(
		@InjectModel(SubmittedResource.name)
		private resourceModel: Model<SubmittedResourceDocument>,
		private transformerService: TransformerService,
		private configService: ConfigService,
	) {}

	async create_resource(
		resource_obj: createResourceDto & { logo: string },
		logo: Express.Multer.File,
	) {
		const res = new this.resourceModel(resource_obj);
		
		res.save();
		return res.toObject();
	}

	async resource_id_taken(resource_id: string): Promise<Boolean> {
		return await !! this.resourceModel.exists({ resource_id });
	}

	@Cron(CronExpression.EVERY_WEEK)
	delete_old_resources() {
		throw new NotImplementedException();
	}
}
