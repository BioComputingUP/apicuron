#!/software/packages/python/3.8.12/bin/python3

from database_tasks.util.database import Database
import argparse
import logging
from database_tasks.tasks.task import Task
from database_tasks.tasks import *


def parse_args():
    parser = argparse.ArgumentParser(prog="APICURON Database Fixer", 
        description='Script to perform Database edits and fixes on APICURON,\n this script organizes database operations into tasks that can be executed together or independently',
        epilog=f"List of available tasks:\n{Task.get_all_descriptions()}", formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument('--host', help='Database Host string', required=True)
    parser.add_argument('-db','--database', help='database name', required=True)
    parser.add_argument('-t','--task', help="Task to run", required=True)
    parser.add_argument('-a', '--arguments', nargs='+', default=[], required=False, help="list of task arguments")
    parser.add_argument('-f', '--file', required=False, help="file argument for task")
    parser.add_argument('--port', help='Database Port string', required=False, type=int, default=27017)

    return parser.parse_args()

if __name__ == '__main__':
    # get collections from argument
    args = parse_args()

    

    Database.connect_db(args.host, args.database, args.port)

    task_name = args.task

    Current_task = Task.get_task(task_name)
    Current_task().run(*args.arguments, file=args.file)
    
    Database.close_connection()
    
    

