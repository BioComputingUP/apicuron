import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { OrcidStrategy } from './orcid.strategy';
import { AuthController } from './auth.controller';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { LocalAuthGuard } from './local-auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/user.schema';
const configService = new ConfigService();
const jwtSecret = configService.get<string>('JWT_SECRET');
console.log('this is jwtsecret: ' + jwtSecret);
@Module({
  providers: [AuthService, OrcidStrategy, UsersService, LocalAuthGuard],
  imports: [
    // PrismaModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    JwtModule.register({
      secret: jwtSecret,
    }),
  ],
  exports: [LocalAuthGuard],
  controllers: [AuthController, UsersController],
})
export class AuthModule {}
