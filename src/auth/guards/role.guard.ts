import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		// get roles from metadata attached to route
		const roles = this.reflector.get<string[]>('roles', context.getHandler());

    console.log('roles from route', roles);

		// get the current user's role
		const request = context.switchToHttp().getRequest();
		const user = request.user;

    console.log('user role', user.role);


		if (roles.includes(user.role)) {
			return true;
		} else {
			return false;
		}
	}
}
