import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SchedulerService } from './scheduler/services/scheduler.service';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    const schedulerService = app.get(SchedulerService)
    const configService = app.get(ConfigService)

    schedulerService.run_task('test_task', process.argv)
    const args = yargs(hideBin(process.argv))
        .option('host', {
            describe:'Database Host string'
        })
        .option('db', {
            alias: 'database',
            describe: 'database name',
        })
        .option('port', {
            describe: 'Database Port string'
        })
        .option('t', {
            alias: 'task',
            describe: 'Task to run',
            choices: schedulerService.get_tasks()
        })
        .option('a', {
            alias: 'arguments',
            describe: 'list of task arguments'
        })
        .option('f', {
            alias: 'file',
            describe: 'file argument for task'
        })
        .help()
        .argv
    
    process.exit(0);
    
}

bootstrap();
