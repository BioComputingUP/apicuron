import { Logger, LogLevel } from "@nestjs/common";
import { CommandRunner, Option } from "nest-commander";

/*
To create a task:
1. Create a class decorated with @Command that extends Task and implements the run method
2. Add the @Command based on nest-commander specifications
3. Add the task to the scheduler module providers array AND the scheduler module exports array
*/
export abstract class Task extends CommandRunner{
	protected logger = new Logger(this.constructor.name);
	@Option({
        flags: '-l, --log-level [logLevel]',
        description: `Log Level`,
        choices: ['log', 'error', 'warn', 'debug', 'verbose'],
        required: false,
        defaultValue: 'log',
    })
    parseLogLevel(val: LogLevel) {
        //TODO: Accept an array of log levels
        this.logger.localInstance.setLogLevels([val]);
        return val;
    }
}