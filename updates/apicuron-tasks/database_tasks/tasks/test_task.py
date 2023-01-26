



from database_tasks.tasks.task import Task

class TestTask(Task):
    
    name= "test_task"

    description="This is a test"

    @classmethod
    def set_arguments(cls, parser):
        parser.add_argument('--name', help='name for test_task')
        

    def exec_task(self, first='default', second='default_2', **kwargs):
        print('Argmeents received', first, second)