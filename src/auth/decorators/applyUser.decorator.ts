import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../core/schemas/user.schema';

export const UserReq = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): User | null => {
		const req = ctx.switchToHttp().getRequest();
		return req?.user;
	},
);
