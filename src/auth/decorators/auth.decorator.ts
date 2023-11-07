import { UseGuards, applyDecorators } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ApiSecurity } from '@nestjs/swagger';

export function AuthProtected() {
	return applyDecorators(UseGuards(LocalAuthGuard), ApiSecurity('basic'));
}
