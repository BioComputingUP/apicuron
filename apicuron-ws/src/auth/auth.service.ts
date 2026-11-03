import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { uuid } from 'uuidv4';
import { UsersService } from './users/services/users.service';
import { assertUserManagesResource } from '../util/authrization.helpers';

export interface userJWT {
	orcid_id: string;
	username: string;
	iat: number;
}

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
		private userService: UsersService,
	) {}

	generate_cookie_token() {
		return uuid();
	}

	async generate_jwt_token(user: userJWT) {
		const db_user = await this.userService.getByOrcid(user.orcid_id);
		const { orcid_id, username } = user;
		const jwt_input: userJWT = {
			orcid_id,
			username,
			iat: new Date().getTime(),
		};
		if (!!db_user && !!db_user.jwt_token) {
			jwt_input['jwt_token'] = db_user.jwt_token;
		}
		const jwtToken = this.jwtService.sign(jwt_input);
		const prefix = this.configService.get<string>('JWT_PREFIX');
		const header = this.configService.get<string>('JWT_HEADER');
		return { header, token: prefix + ' ' + jwtToken };
	}

	public user_has_resource(user, resource_id) {
		assertUserManagesResource(user ?? {}, resource_id);
	}
}
