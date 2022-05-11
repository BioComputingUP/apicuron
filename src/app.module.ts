import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { PrismaModule } from './prisma/prisma.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsModule } from './reports/reports.module';
import devConfig from './config/configuration.dev';
import prodConfig from './config/configuration.prod';

function getConfig() {
  if (process.env.NODE_ENV === 'development') {
    return devConfig;
  }
  if (process.env.NODE_ENV === 'production') {
    return prodConfig;
  }
  return devConfig;
}

@Module({
  imports: [
    AuthModule,
    // isGlobal loads Config Module globally, doesn't require imports
    ConfigModule.forRoot({
      isGlobal: true,
      // ignoreEnvFile: true,
      load: [getConfig()],
    }),
    // in here we use the forRootAsync https://docs.nestjs.com/techniques/mongodb#async-configuration
    // to be able to access the configService asnchronously because it cannot be loaded sooner
    // due to the fact that this is the appmodule
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database_url'),
      }),
    }),
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
