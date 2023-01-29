import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SchedulerService } from './scheduler/services/scheduler.service';
import { ConfigService } from '@nestjs/config';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ArgumentParser } from 'argparse'
import { useContainer } from 'class-validator';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule)
    
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    
    const schedulerService = await app.get(SchedulerService)
    const configService = await app.get(ConfigService)


    function splitter(args:string) {
        return args.split(/\ +|,/)
    }

    const parser = new ArgumentParser({
        description: "Script to perform Database edits and fixes on APICURON,\n this script organizes database operations into tasks that can be executed together or independently",
        prog: "APICURON scheduler",
    })


    parser.add_argument('--host', {help: 'Database Host string', required: false, default: configService.get('db_host')})
    parser.add_argument('--database', {help: 'database name', required: false, default: configService.get('database')})
    parser.add_argument('--task',{ help: "Task to run", required: true })
    parser.add_argument('--arguments', {nargs: '+', default: [], required: false, help: "list of task arguments"})
    parser.add_argument('--file', {required: false, help: "file argument for task"})
    parser.add_argument('--port', {help: 'Database Port string', required: false, type: 'int', default: 27017})


    let args = parser.parse_args()

    console.log({
        args
    })

    await schedulerService.run_task(args.task, args.file, args.arguments)


    await app.close();

}

bootstrap();

