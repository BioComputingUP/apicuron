import {
	CanActivate,
	ExecutionContext,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { User } from '../../core/schemas/user.schema';
import { Reflector } from '@nestjs/core';
import { ResourceIdKey, ResourceIdPlace } from '../constants';

@Injectable()
export class ResourceManagerGuard implements CanActivate {
	constructor(protected reflector: Reflector) {}

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const request: Request = context.switchToHttp().getRequest();

		const resourceIdKeyPlacement: 'params' | 'query' | 'body' =
			this.reflector.getAllAndOverride(ResourceIdPlace, [
				context.getHandler(),
				context.getClass(),
			]) ?? 'params';

		const resourceIdKey: string =
			this.reflector.getAllAndOverride(ResourceIdKey, [
				context.getHandler(),
				context.getClass(),
			]) ?? 'resource_id';

		if (!request.user || !(request.user instanceof User)) {
			return false;
		}
		if (!request.params.resource_id) {
			throw new InternalServerErrorException(
				`No resource_id provided in the requests params`,
			);
		}

		const managedResIds = request.user.resources.map((r) => r.resource_id);

		if (
			!managedResIds.includes(
				request?.[resourceIdKeyPlacement]?.[resourceIdKey],
			)
		) {
			return false;
		}
		return true;
	}
}
