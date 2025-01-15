import { Logger, LogLevel } from "@nestjs/common";
import { CommandRunner, Option } from "nest-commander";

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
        this.logger.localInstance.setLogLevels([val]);
        return val;
    }
}