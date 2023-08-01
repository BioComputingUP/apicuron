import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { OrcidStrategy } from './strategies/orcid.strategy';
import { AuthController } from './auth.controller';
import { UsersService } from './users/users.service';
import { UsersController, UserControllerV2 } from './users/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/schemas/user.schema';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { HttpModule } from '@nestjs/axios';
import { OrcidExists } from './validators/orcidExists.dto';
import { OrcidGuard } from './guards/orcid.guard';
import { PassportModule } from '@nestjs/passport';
import { OrcidMiddleware } from './middlewares/orcid.middleware';
import { JWTStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
	providers: [
		AuthService,
		OrcidStrategy,
		JWTStrategy,
		JwtAuthGuard,
		UsersService,
		OrcidExists,
		OrcidGuard,
	],
	imports: [
		HttpModule,
		ConfigModule,
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
		PassportModule.register({}),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('JWT_SECRET'),
			}),
		}),
	],
	exports: [UsersService, MongooseModule, JwtModule, OrcidExists, AuthService],
	controllers: [AuthController, UsersController, UserControllerV2],
})
export class AuthModule {
	// configure(consumer: MiddlewareConsumer) {
	// 	// consumer.apply(OrcidMiddleware).forRoutes('/*');
	// 	// consumer.apply(AuthMiddleware).forRoutes('/*');
	// }
}
