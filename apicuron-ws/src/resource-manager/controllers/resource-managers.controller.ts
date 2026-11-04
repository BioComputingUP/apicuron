import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	SerializeOptions,
	UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { UserReq } from 'src/auth/decorators/applyUser.decorator';
import { HasAResourceGuard } from 'src/auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { PartnerResourceRepository } from 'src/core/repositories/partner-resource.repository';
import { User } from 'src/core/schemas/user.schema';
import { NotificationsService } from 'src/notifications/notifications.service';
import { VersionHeader } from 'src/plugins/swagger/config';
import { SelectPartnerResourceDto } from 'src/resources/dto/partner-resources.entity';
import { ApiResponseWrapped } from 'src/shared/decorators/wrapped-data-response.decorator';
import { assertUserManagesResource } from 'src/util/authrization.helpers';
import {
	AddManagerDto,
	ManagerParamsDto,
	ResourceManagerEntity,
} from '../dto/resource-manager.dto';
import {
	ResourceManagerEntry,
	ResourceManagerService,
} from '../services/resource-manager.service';

/**
 * Lets the managers of a resource, and the admins, add and remove its managers.
 * Each change notifies the managers, the person removed and the person who made it,
 * so a change made with a leaked token is seen.
 */
@ApiTags('Partner Resources')
@ApiHeader(VersionHeader)
@ApiSecurity('basic')
@Controller({ path: 'partner-resources', version: '2' })
@UseGuards(LocalAuthGuard, HasAResourceGuard)
@SerializeOptions({ type: ResourceManagerEntity })
export class ResourceManagersController {
	constructor(
		protected managers: ResourceManagerService,
		protected partnerResourceRepo: PartnerResourceRepository,
		protected notifications: NotificationsService,
	) {}

	@ApiOperation({ summary: 'List the managers of a resource' })
	@ApiResponseWrapped([ResourceManagerEntity])
	@Get(':resource_id/managers')
	async list_managers(
		@Param() { resource_id }: SelectPartnerResourceDto,
		@UserReq() user: User,
	) {
		assertUserManagesResource(user, resource_id);
		return this.listEntities(resource_id);
	}

	@ApiOperation({
		summary: 'Add a manager to a resource',
		description:
			'The new manager must have logged in to APICURON at least once. Returns the managers after the change.',
	})
	@ApiResponseWrapped([ResourceManagerEntity])
	@Post(':resource_id/managers')
	async add_manager(
		@Param() { resource_id }: SelectPartnerResourceDto,
		@Body() { orcid_id }: AddManagerDto,
		@UserReq() user: User,
	) {
		assertUserManagesResource(user, resource_id);

		const { added } = await this.managers.addManager(resource_id, orcid_id);
		const managers = await this.managers.listManagers(resource_id);
		if (added) {
			const addedManager = managers.find((m) => m.orcid_id === orcid_id);
			await this.notifyChange(
				resource_id,
				user,
				managers,
				[],
				(resourceName) =>
					`${this.describe(user)} added ${this.describe(
						addedManager,
					)} as a manager of ${resourceName}.`,
			);
		}
		return this.toEntities(managers);
	}

	@ApiOperation({
		summary: 'Remove a manager from a resource',
		description:
			'The last manager of a resource cannot be removed. Returns the managers after the change.',
	})
	@ApiResponseWrapped([ResourceManagerEntity])
	@Delete(':resource_id/managers/:orcid_id')
	async remove_manager(
		@Param() { resource_id, orcid_id }: ManagerParamsDto,
		@UserReq() user: User,
	) {
		assertUserManagesResource(user, resource_id);

		const before = await this.managers.listManagers(resource_id);
		const { removed } = await this.managers.removeManager(
			resource_id,
			orcid_id,
		);
		const managers = await this.managers.listManagers(resource_id);
		if (removed) {
			const removedManager = before.find((m) => m.orcid_id === orcid_id);
			await this.notifyChange(
				resource_id,
				user,
				managers,
				[orcid_id],
				(resourceName) =>
					`${this.describe(user)} removed ${this.describe(
						removedManager,
					)} from the managers of ${resourceName}.`,
			);
		}
		return this.toEntities(managers);
	}

	private async listEntities(resource_id: string) {
		return this.toEntities(await this.managers.listManagers(resource_id));
	}

	private toEntities(managers: ResourceManagerEntry[]) {
		return plainToInstance(ResourceManagerEntity, managers, {
			excludeExtraneousValues: true,
		});
	}

	private describe(person?: { orcid_id: string; displayedName?: string }) {
		if (!person) {
			return 'an unknown user';
		}
		return person.displayedName
			? `${person.displayedName} (${person.orcid_id})`
			: person.orcid_id;
	}

	private async notifyChange(
		resource_id: string,
		actor: User,
		managers: ResourceManagerEntry[],
		alsoNotify: string[],
		body: (resourceName: string) => string,
	) {
		const resource = await this.partnerResourceRepo.findOne({ resource_id });
		const resourceName = resource?.resource_name ?? resource_id;
		const recipients = new Set([
			...managers.map((m) => m.orcid_id),
			...alsoNotify,
			actor.orcid_id,
		]);
		await Promise.all(
			[...recipients].map((orcid_id) =>
				this.notifications.create_user_notification(
					`Managers of ${resourceName} changed`,
					body(resourceName),
					orcid_id,
				),
			),
		);
	}
}
