

from abc import abstractmethod
from argparse import ArgumentParser
import logging
import sys
import traceback


class Task:
    # name of the task, should be unique
    name = ''

    # description of the task
    description = ''


    def __init__(self):
        self._setup_logger()

    @classmethod
    def list_tasks(cls):
        return [task.name for task in cls.__subclasses__()]
    
    @classmethod
    def get_all_descriptions(cls):
        output = ''
        for task in cls.__subclasses__():
            output += task._get_description() + '\n'
        return output
    
    @classmethod
    def get_task(cls, name):
        for task in cls.__subclasses__():
            if name == task.name:
                return task
        
        raise Exception('Task {} Not found !'.format(name))

    # get description of current task
    @classmethod
    def _get_description(cls):
        return f'{cls.name}: {cls.description}'


    @classmethod
    def set_arguments(cls, parser: ArgumentParser):
        pass

    def _setup_logger(self):
        self.logger = logging.getLogger(self.name)
        self.logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter('%(asctime)s | %(task_name)s | %(message)s'))
        self.logger.addHandler(handler)
        self.logger = logging.LoggerAdapter(self.logger, { 'task_name': self.name})
    
    @abstractmethod
    def exec_task(self, *args, **kwargs):
        pass

    
    def run(self, *args, **kwargs):
        self.logger.info(f'Starting Task {self.name}...')
        
        try:
            self.exec_task(*args, **kwargs)
            self.logger.info(f'Finished Task {self.name}...')
        except Exception as e:
            self.logger.error(f'Task {self.name} failed: {e} \n{traceback.format_exc()}')
    