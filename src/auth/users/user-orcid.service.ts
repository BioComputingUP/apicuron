import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { HttpService } from '@nestjs/axios'
@Injectable()
export class UserOrcidService {
	constructor(
		protected configService: ConfigService,
        protected httpService: HttpService,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
	) {}
	async check_orcid_update(orcid_id: string) {
		const user = await this.userModel.findOne({
			orcid_id,
		});
		if (
            user &&
			user.last_update &&
			new Date().getDay() - user.last_update.getDay() < 1
		) {
			return;
		} else {
    		const orcid_url = this.configService.get<string>('ORCID_API_URL');
            this.httpService.get(orcid_url + orcid_id, {
                headers: {
                    Accept:'application/json'
                }
            }).subscribe((response) => {
                const given_name = response['person']?.['name']?.['given-names']?.['value'];
                const family_name = response['person']?.['name']?.['family-name']?.['value'];
                
                user.given_name = given_name || user.given_name
                user.family_name = family_name || user.family_name
                user.displayedName = `${user.given_name} ${user.family_name}`


            })
		}

	}
}
