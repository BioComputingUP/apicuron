import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef, NestFactory } from '@nestjs/core';
import { toInteger } from 'lodash';
import { Command, CommandRunner, Option } from 'nest-commander';
import { AppModule } from 'src/app.module';
import { TaskName, TaskRunOptions } from '../constants';

const taskNameChoices = Object.values(TaskName);

@Command({
	name: 'run-task',
	description: 'run a task for apicuron-dev',
	options: { isDefault: true }, // This command is executed if no other is specified
})
export class RunTaskCommand extends CommandRunner {
	constructor(
		@Inject() private readonly config: ConfigService,
		private moduleRef: ModuleRef,
	) {
		super();
	}
	logger = new Logger("Run Task Command");
	async run(extraParams: string[], options: TaskRunOptions): Promise<void> {
		try {
			const envConfig = this.config.get<string>('environment');
			this.logger.debug(`Loaded ${envConfig} Configuration`);
			
			const taskService = this.moduleRef.get(`task:${options.task}`);
			if (taskService) {
				this.logger.debug(`Loaded Task ${options.task}`);
			}else{
				throw new NotFoundException(`Task ${options.task} does not exist`);
			}

			if (!!options.file){
				this.logger.debug(`Running Task ${options.task} with the following arguments: [${extraParams}], file:${options.file}`);
				await taskService.run_task({
					arguments: extraParams,
					file: options.file,
				});
			}else{
				this.logger.debug(`Running Task ${options.task} with the following arguments: [${extraParams}]`);
				await taskService.run_task({ arguments: extraParams });
			}


		} catch (error) {
					
		}
	}

	@Option({
		flags: '-t, --task <task>',
		description: 'Task to run',
		required: true,
		choices: taskNameChoices,
	})
	parseTask(val: string) {
		return val;
	}

	@Option({
		flags: '-h, --host <host>',
		description: 'Database Host string',
		required: true,
	})
	parseHost(val: string) {
		return val;
	}

	@Option({
		flags: '-db, --database <database>',
		description: 'database name',
		required: true,
	})
	parseDatabase(val: string) {
		return val;
	}

	@Option({
		flags: '-p, --port [port]',
		description: 'Database Port',
		required: false,
		defaultValue: 27017,
	})
	parsePort(val: number) {
		return toInteger(val);
	}

	@Option({
		flags: '-f, --file [file]',
		description: 'File name for task',
		required: false,
	})
	parseFile(val: string) {
		return val;
	}
}
