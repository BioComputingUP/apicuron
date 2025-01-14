import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { RunTaskCommand } from './scheduler/commands/run-task.command';
async function bootstrap() {
	await CommandFactory.run(AppModule, ['warn', 'error']);
}

bootstrap();