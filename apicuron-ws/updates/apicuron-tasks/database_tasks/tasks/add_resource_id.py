

from database_tasks.tasks.task import Task
from database_tasks.util.resources import get_resources_dict
from database_tasks.util.database import Database

class AddResourceIdTask(Task):

    name = 'add_resource_id'
    collections = ['reports', 'achievements', 'achievements_def','terms_def','statistics']
    description = f'Task that adds resource_id field to all documents in a list of concerned collections {collections}'

    

    def exec_task(self, *args, **kwargs):
        resources_dict = get_resources_dict(Database.apicuron_db)


        collections = self.collections
        
        for coll_name in collections:
            self.logger.info(f'in collection {coll_name}')
            collection = Database.apicuron_db[coll_name]

            for resource_uri in resources_dict:
                # update each resource's reports by setting the resource_id field
                result = collection.update_many({
                    'resource_uri': resource_uri,
                    'resource_id': {
                        '$exists': False
                    }
                },{
                    '$set':{
                        'resource_id': resources_dict[resource_uri]
                    }
                })
                
                self.logger.info(f'\tFor Resource: {resources_dict[resource_uri]}')
                self.logger.info(f'\t\tMatched count: {result.matched_count}')
                self.logger.info(f'\t\tModified count {result.modified_count}')