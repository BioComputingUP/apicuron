import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common'
import { ArgumentParser } from 'argparse'
import { useContainer } from 'class-validator';


const parser = new ArgumentParser({
    description: "Script to perform Database edits and fixes on APICURON,\n this script organizes database operations into tasks that can be executed together or independently",
    prog: "APICURON scheduler",
})


parser.add_argument('--host', {help: 'Database Host string', required: true })
parser.add_argument('--database', {help: 'database name', required: true })
parser.add_argument('--task',{ help: "Task to run", required: true })
parser.add_argument('--arguments', {nargs: '+', default: [], required: false, help: "list of task arguments"})
parser.add_argument('--file', {required: false, help: "file argument for task"})
parser.add_argument('--port', {help: 'Database Port string', required: false, type: 'int', default: 27017})


const args = parser.parse_args()
process.env.DATABASE_HOST = args.host
process.env.DATABASE = args.database
process.env.port = args.DB_PORT = args.port

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule)
    
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    
    const taskService = await app.get(`task:${args.task}`)
    
    if(taskService){
        const mainLogger = new Logger('APICURONSchedulerLogger');

        if(!!args.file){
            mainLogger.log(`Loaded Task ${args.task}... running with the following arguments: [${args.arguments}], file:${args.file}`)
            await taskService.run_task(args.file, ...args.arguments)
        }
        else{
            mainLogger.log(`Loaded Task ${args.task}... running with the following arguments: [${args.arguments}], `)
            await taskService.run_task(...args.arguments)
        }
    }


    await app.close();

}

bootstrap();

