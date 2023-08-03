import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common'
import { ArgumentParser } from 'argparse'
import { useContainer } from 'class-validator';
import { spawn, spawnSync } from 'child_process';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';


const parser = new ArgumentParser({
    description: `Script to perform Database edits and fixes on APICURON,\n this script organizes database operations into tasks that can be executed together or independently
    Tasks to run:
    - disprot_update: updates APICUROn with the latest version of the database from disprot
    - compute_achievements [resource_id,orcid_id?]: runs compute_medals and compute_badges
    - compute_statistics [resource_id,orcid_id?]: Computes statistics (meant to be ran after compute_achievements) for an entire resource or a single user when specifying optional orcid_id option
    - compute_medals: Computes medals for an entire resource or a single user when specifying optional orcid_id option
    - compute_badges: Computes badges for an entire resource or a single user when specifying optional orcid_id option
    
    `,
    prog: "APICURON scheduler",
})


parser.add_argument('--host', {help: 'Database Host string', required: true })
parser.add_argument('-db', {help: 'database name', required: true })
parser.add_argument('-t',{ help: "Task to run", required: true })
parser.add_argument('-a', {nargs: '+', default: [], required: false, help: "list of task arguments"})
parser.add_argument('-f', {required: false, help: "file argument for task"})
parser.add_argument('--port', {help: 'Database Port string', required: false, type: 'int', default: 27017})


const args = parser.parse_args()
process.env.DATABASE_HOST = args.host
process.env.DATABASE = args.db
process.env.port = args.DB_PORT = args.port

// handle the unique case if the job is to update_disprot, then it should be dealt with by calling the python script
if(args.t == 'disprot_update'){
    const script_path = join(__dirname, '../updates/apicuron-tasks/main.py')
    

    const result = spawnSync(`python3`, [script_path,...process.argv.slice(2)], {stdio: 'inherit'})
    if(result.error){
        console.log(result.error)
    }
    process.exit(result.status)
}

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule)
    
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

	const configService = app.get(ConfigService);
	const appLogger = new Logger('APICURONCLIApplicationLogger');

    const envConfig = configService.get<string>('environment');
	appLogger.log(`Loaded ${envConfig} Configuration`);

    
    const taskService = await app.get(`task:${args.t}`)

    
    if(taskService){
        console.log('taskService Found !')
        const mainLogger = new Logger('APICURONSchedulerLogger');

        if(!!args.f){
            mainLogger.log(`Loaded Task ${args.t}... running with the following arguments: [${args.a}], file:${args.f}`)
            await taskService.run_task({
                arguments: args.a,
                file: args.f
            })
        }
        else{
            mainLogger.log(`Loaded Task ${args.t}... running with the following arguments: [${args.a}], `)
            await taskService.run_task({arguments: args.a})
        }
    }


    await app.close();

}

bootstrap();

