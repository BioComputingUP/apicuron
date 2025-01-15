import { Logger, LogLevel } from '@nestjs/common';
import { log } from 'console';
import { CommandRunner, Option } from 'nest-commander';

/*
To create a task:
1. Create a class decorated with @Command that extends Task and implements the run method
2. Add the @Command based on nest-commander specifications
3. Add the task to the scheduler module providers array AND the scheduler module exports array
*/
const allLogLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];
export abstract class Task extends CommandRunner {
	protected logger = new Logger(this.constructor.name);

	@Option({
		flags: '-l, --log-level <logLevel...>',
		description: `Specify the log level (allow multiple) for the task, defaults to all`,
		choices: allLogLevels,
		required: false,
	})
	parseLogLevel(val: LogLevel, logLevelsAcc: LogLevel[] = []): LogLevel[] {
		if (!val) {
			logLevelsAcc = allLogLevels;
		} else if (!allLogLevels.includes(val)) {
			this.logger.error(`Invalid log level ${val}`);
			throw new Error(`Invalid log level ${val}`);
		} else {
			logLevelsAcc.push(val);
		}

		this.logger.debug(`Setting log levels to ${logLevelsAcc}`);
		this.logger.localInstance.setLogLevels(logLevelsAcc);
		return logLevelsAcc;
	}
}
