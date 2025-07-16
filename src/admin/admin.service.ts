import { HttpService } from '@nestjs/axios';
import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	BadgeDef,
	BadgeDefModel,
	MedalDef,
	MedalDefModel,
	PartnerResource,
	PartnerResourceModel,
	Term,
	TermModel,
	User,
	UserModel,
} from 'src/core/schemas';

@Injectable()
export class AdminService {
	logger = new Logger(AdminService.name);
	constructor(
		protected httpService: HttpService,
		@InjectModel(MedalDef.name)
		protected medalDefModel: MedalDefModel,
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: BadgeDefModel,
		@InjectModel(PartnerResource.name)
		protected partnerResourceModel: PartnerResourceModel,
		@InjectModel(Term.name)
		protected termModel: TermModel,
		@InjectModel(User.name)
		protected userModel: UserModel,
	) {}

	async migrate_resource(
		resource_id: string,
		admin_orcids: string[],
		base_url: string,
		overwrite = false,
	) {
		const { resource, terms, medals, badges } = await this.retrieve_resource(
			resource_id,
			base_url,
		);
		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { logo, ...query } = resource;
			if (overwrite) {
				await this.partnerResourceModel.deleteOne({ resource_id });
			}
			await this.partnerResourceModel.create(query);
			// const res = await this.partnerResourceModel.updateOne(
			// 	{ resource_id },
			// 	resource,
			// 	{
			// 		upsert: true,
			// 		setDefaultsOnInsert: true,
			// 	},
			// );
		} catch (e) {
			console.log(e);
			throw new InternalServerErrorException(
				`Failed to migrate resource ${resource_id}`,
			);
		}

		try {
			await this.termModel.deleteMany({ resource_id });
			await this.termModel.insertMany(terms);

			await this.medalDefModel.deleteMany({ resource_id });
			await this.medalDefModel.insertMany(medals);

			await this.badgeDefModel.deleteMany({ resource_id });
			await this.badgeDefModel.insertMany(badges);
		} catch (error) {
			this.logger.error(`Failed to migrate terms, medals, or badges`);
			console.log(error);
			throw new InternalServerErrorException(
				`Failed to migrate terms, medals, or badges`,
			);
		}

		admin_orcids.forEach(async (orcid_id) => {
			try {
				await this.userModel.findOneAndUpdate(
					{ orcid_id },
					{
						$addToSet: {
							resources: {
								resource_id,
								name: resource.resource_name,
							},
						},
					},
				);
			} catch (error) {
				this.logger.error(
					`Failed to add resource ${resource_id} to user ${orcid_id}: ${error.message}`,
				);
				throw new InternalServerErrorException(
					`Failed to add resource ${resource_id} to user ${orcid_id}`,
				);
			}
		});

		this.logger.log(
			`Successfully migrated resource ${resource_id} with ${terms.length} terms, ${medals.length} medals, and ${badges.length} badges from ${base_url}`,
		);
	}

	async retrieve_resource(resource_id: string, base_url: string) {
		const resource_url = `${base_url}/api/partner-resources/${resource_id}`;
		const terms_url = `${base_url}/api/terms?resource_id=${resource_id}`;
		const medals_url = `${base_url}/api/achievements-def/medals?resource_id=${resource_id}`;
		const badges_url = `${base_url}/api/achievements-def/badges?resource_id=${resource_id}`;

		const base_config = {
			headers: {
				Accept: 'application/json',
				version: '2',
			},
		};

		const resource_def_response = await this.httpService.axiosRef.get(
			resource_url,
			base_config,
		);
		const resource_def: PartnerResource = resource_def_response.data.data;
		if (!resource_def) {
			this.logger.error(
				`Failed to fetch resource definition when migrating resource ${resource_id}`,
			);
			throw new NotFoundException(
				`Failed to fetch resource definition when migrating resource ${resource_id}`,
			);
		}

		const terms_defs_promise = this.httpService.axiosRef.get(
			terms_url,
			base_config,
		);

		const medals_defs_promise = this.httpService.axiosRef.get(
			medals_url,
			base_config,
		);

		const badges_defs_promise = this.httpService.axiosRef.get(
			badges_url,
			base_config,
		);

		const responses = await Promise.all([
			terms_defs_promise.then((response) => {
				return response.data.data;
			}),
			medals_defs_promise.then((response) => {
				return response.data.data;
			}),
			badges_defs_promise.then((response) => {
				return response.data.data;
			}),
		]);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		return {
			resource: resource_def,
			terms: responses[0],
			medals: responses[1],
			badges: responses[2],
		};
	}
}
