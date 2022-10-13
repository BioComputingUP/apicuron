import {
	Controller,
	Get,
	Logger,
	Req,
	Redirect,
	UseGuards,
	Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UsersService } from './users/users.service';

@Controller({
	path: 'auth'
})
export class AuthController {
	constructor(private authService: AuthService, private configService: ConfigService, private userService: UsersService) {}

	private authControllerLogger = new Logger(AuthController.name);

	// redirect to orcid
	@Get('orcid')
	@UseGuards(AuthGuard('orcid'))
	authenticate_orcid() {}

	@Get('orcid_permission')
	@UseGuards(AuthGuard('orcid'))
	orcid_permission() {}

	@Get('orcid/redirect')
	@Redirect('/orcid/', 301)
	@UseGuards(AuthGuard('orcid'))
	async orcid_redirect(@Req() req, @Res() res) {
		// console.log('redirect request', req)
		const user = req.user
		const { header, token } = await this.authService.generate_jwt_token(user);
		res.cookie(header, token);
		res.set(header, token);
		return { url: this.configService.get('FRONTEND_HOST') + 'curators/' + user.orcid_id, statusCode: 301 };
	}

	@Get('/orcid/:orcid_id')
	@Roles('user', 'admin')
	@UseGuards(LocalAuthGuard, RoleGuard)
	protected_page(@Req() request) {
		return 'Can be accessed';
	}

	@Get('profile')
	@UseGuards(LocalAuthGuard)
	async get_user_profile(@Req() request){
		const user = await this.userService.get_by_orcid(request.user.orcid_id);
		return user
	}
}
