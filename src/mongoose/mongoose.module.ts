import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule as MongooseModuleLibrary } from '@nestjs/mongoose';
const mongooseLogger = new Logger('MongooseLogger');
const configService = new ConfigService();

const db_url = configService.get<string>('DATABASE_URL');

@Module({
  imports: [
    MongooseModuleLibrary.forRoot(db_url, () => {
      mongooseLogger.log('Connected to ' + db_url);
    }),
  ],
})
export class MongooseModule {}
