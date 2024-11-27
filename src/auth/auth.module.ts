import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { OrcidStrategy } from './strategies/orcid.strategy';
import { AuthController } from './auth.controller';
import { UsersService } from './users/services/users.service';
import { UsersController, UserControllerV2 } from './users/users.controller';
import { HttpModule } from '@nestjs/axios';
import { OrcidExists } from './validators/orcidExists.dto';
import { OrcidGuard } from './guards/orcid.guard';
import { PassportModule } from '@nestjs/passport';
import { JWTStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CoreApicuronModule } from '../core/core.module';
import { UsersEventHandlers } from './users/services/users-event-handlers.service';
import { OrcidClientModule } from 'src/orcid/orcid-client/orcid-client.module';

@Module({
	providers: [
		AuthService,
		OrcidStrategy,
		JWTStrategy,
		JwtAuthGuard,
		UsersService,
		UsersEventHandlers,
		OrcidExists,
		OrcidGuard,
	],
	imports: [
		CoreApicuronModule,
		HttpModule,
		ConfigModule,
		PassportModule.register({}),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('JWT_SECRET'),
			}),
		}),
		OrcidClientModule,
	],
	exports: [UsersService, JwtModule, OrcidExists, AuthService],
	controllers: [AuthController, UsersController, UserControllerV2],
})
export class AuthModule {
	// configure(consumer: MiddlewareConsumer) {
	// 	// consumer.apply(OrcidMiddleware).forRoutes('/*');
	// 	// consumer.apply(AuthMiddleware).forRoutes('/*');
	// }
}
