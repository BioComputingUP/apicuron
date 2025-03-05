import {
	Body,
	Controller,
	Get,
	Headers,
	HttpStatus,
	NotFoundException,
	Param,
	Patch,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { UpdateProfileDto, UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './services/users.service';
import { Logger } from '@nestjs/common';
import { Response } from 'express';
import { Roles } from '../decorators/roles.decorator';
import { json_to_tsv } from './helpers/json-tsv';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import {
	ApiBody,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import { VersionHeader } from '../../plugins/swagger/config';
import { User } from '../../core/schemas/user.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Public } from '../decorators/public.decorator';

import { UserReq } from '../decorators/applyUser.decorator';
import { UserRepository } from '../../core/repositories/user.repository';
import { AuthProtected } from '../decorators/auth.decorator';

@ApiTags('First Version')
@Controller('')
export class UsersController {
	constructor(private usersService: UsersService) {}
	private usersControllerLogger = new Logger(UsersController.name);

	@Post('/registerUser')
	@Roles('admin')
	@UseGuards(LocalAuthGuard, RoleGuard)
	create_or_update_user(@Body() userData: UpdateUserDto, @Res() res) {
		// console.log(`Received message: ${userData}`);
		this.usersService
			.createOrUpdateUser(userData)
			.then((response) => {
				this.usersControllerLogger.log(response);
				res.status(HttpStatus.ACCEPTED).send({
					statusCode: HttpStatus.ACCEPTED,
					message: `Created or upserted user orcid ${userData.orcid_id}`,
				});
			})
			.catch((err) => {
				this.usersControllerLogger.error(err);
				res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An Internal Error Occured',
				});
			});
	}

	@Get('/browse')
	// @Roles('user')
	@UseGuards(LocalAuthGuard)
	async get_user_stats(@Param() params, @Res() res: Response) {
		// params['orcid_filter'] =

		const result = await this.usersService.get_users_with_stats(params);

		res.header('count', result[0]['biocurators_count']);
		res.send(result[0]['biocurators']);
	}

	@Get('/achievements')
	async get_user_achievements(
		@Param() params,
		@Req() req,
		@Headers('format') format,
		@Res() res,
	) {
		const result = await this.usersService.get_achievements({
			...params,
			user: !!req.user ? req.user.orcid_id : null,
		});
		if (!!format && format == 'tsv') {
			res.set({
				'Content-Type': 'text/tab-separated-values',
				'Content-Disposition':
					'attachment; filename="apicuron_achievements.tsv"',
			});
			res.send(json_to_tsv(result));
		} else if (!format || (!!format && format == 'json')) {
			res.set({
				'Content-Type': 'application/json',
				'Content-Disposition':
					'attachment; filename="apicuron_achievements.json"',
			});

			res.send(result);
		}
	}
}

@ApiTags('Users')
@ApiHeader(VersionHeader)
@Controller({
	version: '2',
	path: 'users',
})
export class UserControllerV2 {
	constructor(
		private usersService: UsersService,
		protected userModel: UserRepository,
		private eventEmitter: EventEmitter2,
	) {}
	private logger = new Logger(UserControllerV2.name);

	@Get(':orcid_id')
	@AuthProtected()
	@Public()
	async get_curator(
		@Param('orcid_id') orcid_id: string,
		@UserReq() userReq?: User,
	) {
		const user = await this.usersService.getPublicUser(orcid_id, userReq);

		if (!user) {
			throw new NotFoundException(
				`The User with orcid ${orcid_id} does not exist on APICURON`,
			);
		}
		return user;
	}

	@ApiSecurity('basic')
	@ApiOperation({
		summary: 'Update the information about a partner resource',
	})
	@ApiBody({
		description:
			'An object that updates the profile of a user, containing an email or a privacy setting (both optional)',
		type: UpdateProfileDto,
	})
	@ApiOkResponse({
		description: 'Returns an update confirmation Object',
		type: UpdateProfileDto,
	})
	@AuthProtected()
	@Patch('')
	async updateProfile(
		@UserReq() user: User,
		@Body() updateProfile: UpdateProfileDto,
	) {
		const { orcid_id } = updateProfile;
		if (user.orcid_id !== orcid_id) {
			throw new UnauthorizedException('Cannot update the data of another User');
		}
		await this.usersService.updateUserProfile(updateProfile);
		return 'Profile Updated';
	}
}
