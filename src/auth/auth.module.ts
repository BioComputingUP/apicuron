import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { OrcidStrategy } from './orcid.strategy';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService, OrcidStrategy],
  imports: [
    UsersModule,
    JwtModule.register({
      // TODO: figure out a way to get the secret from ENV
      secret: 'Secret'
    })],
  controllers: [AuthController]
})
export class AuthModule {
  constructor(configService: ConfigService) {

  }
}
