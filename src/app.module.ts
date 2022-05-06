import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MongooseModule } from '@nestjs/mongoose';

const appModuleLogger = new Logger("MongooseLogger")
const configService = new ConfigService()

const db_url = configService.get<string>('DATABASE_URL')
@Module({
  imports: [AuthModule,
    // isGlobal loads Config Module globally, doesn't require imports
    ConfigModule.forRoot({ isGlobal: true}),
    PrismaModule,
    MongooseModule.forRoot(db_url,() => {
      appModuleLogger.log('Connected to ' + db_url)
  }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
