import {
	Controller,
	Get,
	Logger,
	Req,
	UseGuards,
	Render,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import {
	ApiExcludeEndpoint,
	ApiHeader,
	ApiOkResponse,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import { OrcidGuard } from './guards/orcid.guard';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UsersService } from './users/users.service';

@Controller({
	path: 'auth',
})
export class AuthController {
	constructor(
		private authService: AuthService,
		private configService: ConfigService,
		private userService: UsersService,
	) {}

	private authControllerLogger = new Logger(AuthController.name);

	// redirect to orcid
	@ApiExcludeEndpoint()
	@Get('orcid')
	@UseGuards(OrcidGuard)
	authenticate_orcid() {}

	@ApiExcludeEndpoint()
	@Get('orcid_permission')
	@UseGuards(OrcidGuard)
	orcid_permission() {}

	@ApiExcludeEndpoint()
	@Get('orcid/redirect')
	// @Redirect('/orcid/', 301)
	@Render('auth')
	@UseGuards(OrcidGuard)
	orcid_redirect(@Req() req) {
		const user = req.user;
		return {
			access_token: user.orcid_permission,
			refresh_token: user.refresh_token,
			message: 'testing message',
		};
	}

	@ApiExcludeEndpoint()
	@Get('token')
	@UseGuards(LocalAuthGuard)
	async get_jwt_token(@Req() req) {
		if (req.headers['authorization'] && !req.headers['orcid-token']) {
			return {
				token: req.headers['authorization'],
			};
		}
		const { header, token } = await this.authService.generate_jwt_token(
			req.user,
		);
		return { token };
	}

	@ApiExcludeEndpoint()
	@Get('/orcid/:orcid_id')
	@Roles('user', 'admin')
	@UseGuards(LocalAuthGuard, RoleGuard)
	protected_page(@Req() request) {
		return 'Can be accessed';
	}

	// swagger documentation decorators
	@ApiTags('Users')
	@ApiSecurity('basic')
	// TODO: finish implementation of the docs
	@ApiOkResponse({
		description: 'An Object describing the current User and his information',
	})
	// nestjs logic decorators
	@Get('profile')
	@UseGuards(LocalAuthGuard)
	async get_user_profile(@Req() request) {
		const user = await this.userService.getPrivateUser({
			orcid_id: request.user.orcid_id,
		});
		return user;
	}
}
