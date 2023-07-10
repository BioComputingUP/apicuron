import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { TaskArgument } from '../../scheduler-client/types/baseTask';
import { Statistics, StatisticsDocument } from '../../statistics/schemas/statistics.schema';
import { UsersService } from '../users/users.service';


@Injectable()
export class OrcidSubmissionTask {


    constructor(@InjectModel(Statistics.name) protected statModel: Model<StatisticsDocument>,
     protected userService: UsersService,
     protected config: ConfigService,
     protected partnerResourceService: PartnerResourcesService,
     protected httpService: HttpService) {}


    async run_task(task_args: TaskArgument) {

        const fontendHost: string = this.config.get<string>("FRONTEND_HOST")

        const [resource_id, orcid_id] = task_args.arguments;

        if(resource_id){
            const statsCursor = this.statModel.find({ resource_id, privacy: 'public' }).cursor();

            for await (const stat of statsCursor) {
                const user = await this.userService.get_by_orcid(stat.curator_orcid);
                if(user && user.orcid_permission){

                    const resource = await this.partnerResourceService.get_resource(stat.resource_id);
                    
                    this.httpService.post(`https://api.sandbox.orcid.org/v3.0/${user.orcid_id}/works`, {
                        bulk: {
                            work: {
                                title: {
                                    title: {
                                        value: `Contributions to ${resource.resource_name}`
                                    }
                                },
                                type: 'data-set',
                                'short-description': `Made ${stat.total_count} contributions`,
                                'external-ids': {
                                    'external-id': [
                                        {
                                            'external-id-type': 'uri',
                                            'external-id-value': `${fontendHost}curators/${user.orcid_id}#{resource_name}`,
                                            'external-id-url': {
                                                'value': `${fontendHost}curators/${user.orcid_id}#{resource_name}`
                                            },
                                            'external-id-relationship': 'self'
                                        }
                                    ]
                                }
                            }
                        }
                    }, {
                        headers: {
                            Accept: 'application/json',
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${user.orcid_permission}`
                        }
                    })
                    

                }
            }



        }




    }

}