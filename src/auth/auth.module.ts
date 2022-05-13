import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { OrcidStrategy } from './orcid.strategy';
import { AuthController } from './auth.controller';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/user.schema';

@Module({
  providers: [AuthService, OrcidStrategy, UsersService],
  imports: [
    // PrismaModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    }),
  ],
  exports: [UsersService],
  controllers: [AuthController, UsersController],
})
export class AuthModule {}
