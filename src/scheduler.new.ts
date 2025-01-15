import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { LogLevel } from '@nestjs/common';
async function bootstrap() {
	const logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];	
	await CommandFactory.run(AppModule, logLevels);
	process
}

bootstrap();