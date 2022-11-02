import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { OrcidStrategy } from './orcid.strategy';
import { AuthController } from './auth.controller';
import { UsersService } from './users/users.service';
import { UsersController, UserControllerV2 } from './users/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/schemas/user.schema';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { HttpModule } from '@nestjs/axios';
import { OrcidExists } from './validators/orcidExists.dto';
// import { OrcidExists } from './validators/orcidExists.dto';

@Module({
	providers: [AuthService, OrcidStrategy, UsersService, OrcidExists],
	imports: [
		HttpModule,
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			}
		]),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('JWT_SECRET'),
			}),
		}),
	],
	exports: [UsersService, MongooseModule, JwtModule, OrcidExists],
	controllers: [AuthController, UsersController, UserControllerV2],
})
export class AuthModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('/*');
	}
}
