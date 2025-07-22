import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { throwError } from 'src/util/error.utils';
import { UserRepository } from '../../core/repositories/user.repository';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';

@Injectable()
export class OrcidSubmissionTask {
	constructor(
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		protected userModel: UserRepository,
		protected config: ConfigService,
		protected partnerResourceService: PartnerResourcesService,
		protected httpService: HttpService,
	) {}

	logger = new Logger(OrcidSubmissionTask.name);

	async run_task(task_args: any) {
		const [resource_id, orcid_id] = task_args.arguments;

		if (resource_id) {
			const statsCursor = this.statModel.find({ resource_id }).cursor();

			for await (const stat of statsCursor) {
				const user = await this.userModel.findOne({
					orcid_id: stat.curator_orcid,
				});
				if (
					user &&
					user.orcid_permission &&
					user.orcid_scope?.includes('/activities/update')
				) {
					this.submitWorks(user, stat);
				}
			}
		}
	}

	// test orcid submission
	// const submitOrcid = get('task:submit-orcid')
	// const { getModelToken } = require('@nestjs/mongoose')
	// const userModel = get(getModelToken('User'))
	// const user = await userModel.findOne({ orcid_id: '0000-0002-2472-5685' })
	// const statModel = get(getModelToken('Statistics'))
	// const stat = await statModel.findOne({ resource_id: 'disprot', curator_orcid: user.orcid_id })
	// await submitOrcid.submitWorks(user, stat)

	async submitWorks(user: UserDocument, stat: StatisticsDocument) {
		const fontendHost: string =
			this.config.get<string>('FRONTEND_HOST') ??
			throwError(Error, 'FRONTEND_HOST is not defined in the configuration');
		const orcidApiUrl: string =
			this.config.get('ORCID_API_URL') ??
			throwError(Error, 'ORCID_API_URL is not defined in the configuration'); // this.config.get<string>('ORCID_API_URL');

		const resource = await this.partnerResourceService.get_resource(
			stat.resource_id,
		);

		const description = `Made ${stat.total_count} contributions.`;

		if (user.hasResourcePutCode(stat.resource_id)) {
			// this is an update of a an existing work
			const resourcePutCode =
				user.getResourcePutCode(stat.resource_id)?.putCode ??
				throwError(Error, 'Resource put code not found');

			const rawData = `
            <?xml version="1.0" encoding="UTF-8"?>
            <work:work
                xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.orcid.org/ns/work /work-3.0.xsd"
                put-code="${resourcePutCode}">	
                <work:title>
                    <common:title>Contributions to ${resource.resource_name}</common:title>
                </work:title>
                <work:short-description>${description}</work:short-description>
                <work:type>data-set</work:type>
                <common:external-ids>
                    <common:external-id>
                        <common:external-id-type>uri</common:external-id-type>
                        <common:external-id-value>APICURON Profile</common:external-id-value>			
                        <common:external-id-url>${fontendHost}curators/${user.orcid_id}#${resource.resource_name}</common:external-id-url>
                        <common:external-id-relationship>self</common:external-id-relationship>
                    </common:external-id>
                </common:external-ids>
            </work:work>
            `;
			const response = await this.httpService.axiosRef.put(
				`${orcidApiUrl}${user.orcid_id}/work/${resourcePutCode}`,
				rawData.trim(),
				{
					headers: {
						Accept: '*/*',
						'Content-type': 'application/vnd.orcid+xml',
						Authorization: `Bearer ${user.orcid_permission}`,
					},
				},
			);

			if (response.status < 200 || response.status >= 400) {
				this.logger.error(`Error Status ${response.status}`);
				this.logger.error(`Error Response Header ${response.headers}`);
				this.logger.error(`Error Response Body ${response.data}`);
			}
		} else {
			// first time submision

			const rawData = `
            <?xml version="1.0" encoding="UTF-8"?>
            <work:work
                xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.orcid.org/ns/work /work-3.0.xsd ">	
                <work:title>
                    <common:title>Contributions to ${resource.resource_name}</common:title>
                </work:title>
                <work:short-description>${description}</work:short-description>
                <work:type>data-set</work:type>
                <common:external-ids>
                    <common:external-id>
                        <common:external-id-type>uri</common:external-id-type>
                        <common:external-id-value>APICURON Profile</common:external-id-value>			
                        <common:external-id-url>${fontendHost}curators/${user.orcid_id}#${resource.resource_name}</common:external-id-url>
                        <common:external-id-relationship>self</common:external-id-relationship>
                    </common:external-id>
                </common:external-ids>
            </work:work>
        `;

			const response = await this.httpService.axiosRef.post(
				`${orcidApiUrl}${user.orcid_id}/work`,
				rawData.trim(),
				{
					headers: {
						Accept: '*/*',
						'Content-type': 'application/vnd.orcid+xml',
						Authorization: `Bearer ${user.orcid_permission}`,
					},
				},
			);

			if (response.status == 409) {
				// a conflict, work already exists but we do not have the put-code
				this.logger.error(
					`User ${user.orcid_id} has no put-code but work creation failed on code 409`,
				);
				this.logger.error(`response headers:\n${response.headers}`);
				this.logger.error(`response data:\n${response.data}`);
			}
			if (response.status == 201) {
				// Work added successfully, we retrieve the put-code
				const splitUrl = response.headers.location.split('/');

				const orcid_work_put_code = splitUrl[splitUrl.length - 1];
				// user.orcid_work_put_codes.push();
				await this.userModel.updateOne(
					{
						orcid_id: user.orcid_id,
					},
					{
						$push: {
							orcid_work_put_codes: {
								resource_id: stat.resource_id,
								putCode: orcid_work_put_code,
							},
						},
					},
				);
				// const userInstance = new this.userModel(user);
				// await userInstance.save();
				return;
			}
		}
	}
}
