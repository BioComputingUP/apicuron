import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SchedulerService } from './scheduler/services/scheduler.service';
import { program, Option, Command, Argument } from 'commander'
import { hideBin } from 'yargs/helpers'
import { ConfigService } from '@nestjs/config';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ArgumentParser } from 'argparse'

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule)

    const schedulerService = await app.select(SchedulerModule).get(SchedulerService)
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

    // program
    //     .addOption(new Option('--host <string>', 'hostname of the database').default(configService.get('db_host')))
    //     .addOption(new Option('-db --database <string>', 'database name').default(configService.get('database')))
    //     .addOption(new Option('-p --port <number>', 'Port of the database').default(configService.get('db_port')))
    //     .addOption(new Option('-t --task <string>', 'Name of task to run').makeOptionMandatory().choices(schedulerService.tasks))
    //     .addOption(new Option('-a --arguments <string>', 'The arguments destined to the task, separated by commas').argParser(splitter))
    //     .addOption(new Option('-f --file <File>', 'file argument for task'))

   
    // program.parse()
    
    // const options = program.opts()
    
    // await schedulerService.run_task(options.task, options.file, ...options.arguments)



    await app.close();

}

bootstrap();

