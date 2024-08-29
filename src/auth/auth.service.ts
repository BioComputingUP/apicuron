import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { uuid } from 'uuidv4';
import { UsersService } from './users/users.service';

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
		// get the resources list that belong to the current user
		const user_resources: Array<{ resource_id: string }> = user.resources;
		// check if the resource belongs to the user
		const resource_found = user_resources.find(
			(resource) => resource.resource_id == resource_id,
		);
		// if it doesn't, we respond with  a 403 exception
		if (!resource_found) {
			throw new ForbiddenException(
				`You either do not have the authorization to update the terms of the (${resource_id}) resource or the resource does not exist`,
			);
		}
	}
}
