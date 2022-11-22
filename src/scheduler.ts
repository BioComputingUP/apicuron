import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SchedulerService } from './scheduler/services/scheduler.service';
import yargs, { config } from 'yargs'
import { hideBin } from 'yargs/helpers'
import { ConfigService } from '@nestjs/config';
import { type } from 'os';


async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    const schedulerService = app.get(SchedulerService)
    const configService = app.get(ConfigService)

    const args = yargs(hideBin(process.argv))
        .options(
            {
                'host': {
                    describe: 'Database Host string',
                    default: configService.get('db_host'),
                    type: 'string'
                },
                'db': {
                    alias: 'database',
                    describe: 'database name',
                    default: configService.get('database'),
                    type: 'string'
                },
                'port': {
                    describe: 'Database Port string',
                    default: configService.get('db_port'),
                    type: 'number'
                },
                'task': {
                    alias: 't',
                    describe: 'Task to run',
                    demandOption: true,
                    choices: schedulerService.get_tasks(),
                    type: 'string'
                },
                'arguments': {
                    alias: 'a',
                    describe: 'list of task arguments',
                    type: 'array'
                },
                'file': {
                    alias: ['file', 'f'],
                    describe: 'file argument for task',
                    type: 'string'
                }
            })
        // .alias('t', 'task')
        .help()
        .argv

    // console.log('log: ', args.t)
    console.log('log: ', args.task)
    schedulerService.run_task(args.task, args)
    schedulerService.

    process.exit(0);

}

bootstrap();
