
import itertools
from database_tasks.util.database import Database
from database_tasks.tasks.task import Task


# global vars config
curation_database = 'apicuron_update'
apicuron_database = 'apicuron'
collection = 'reports'
apicuron_collection = 'reports'
resource_uri = 'https://registry.identifiers.org/registry/disprot'
resource_id = 'disprot'

class DisprotUpdateTask(Task):

    name='disprot_update'

    description = 'Task that updates entries from disprot that are stored in a different database\n\t Accepts curation_database as first argument'

    def exec_task(self, curation_database='apicuron_update', *args , **kwargs):

        apicuron_db = Database.apicuron_db
        curation_db = Database.get_db(curation_database)

        # setup the terms list to classify the reports based on their category
        terms = apicuron_db['terms_def'].find({
            'resource_uri': resource_uri
        })
        terms_dict = {term['activity_term']: term['activity_category'] for term in terms}
        # self.logger.info('terms_dict' , terms_dict)
        # return
        # Request the reports

        db = curation_db[curation_database]
        aggregation_pipeline = [
            {
                '$group': {
                    '_id': {
                        'entity_uri': '$entity_uri',
                        'resource_uri': '$resource_uri',
                        'curator_orcid': '$curator_orcid'
                    },
                    'reports': {
                        '$addToSet': {
                            '_id': '$_id',
                            'timestamp': '$timestamp',
                            'activity_term': '$activity_term',
                        }
                    }
                }
            }
        ]

        reports = curation_db[collection].aggregate(aggregation_pipeline)
        processed_document_ids = set()


        for report_group in reports:
            revisions = []
            for report in report_group['reports']:
                # keep the ids of the treated reports in a set
                processed_document_ids.add(report.pop('_id'))

                if terms_dict[report['activity_term']] != 'revision':
                    report_dict = {**report, **
                                report_group['_id'], 'resource_uri': resource_uri}
                    apicuron_db[apicuron_collection].insert_one(report_dict)
                else:
                    revisions.append(report)

                # revisions.sort(key= lambda x : x['timestamp'] )
            if len(revisions) > 1:
                # handle duplicates
                # group the revisions by day,
                # if they occur on the same day, we only account for the last effort
                for day, group in itertools.groupby(revisions, lambda x: x['timestamp'].date()):
                    group_list = list(group)
                    group_list.sort(key=lambda x: x['timestamp'])

                    self.logger.info('{} reports from {} reduced to one'.format(len(group_list), report_group['_id']['curator_orcid']))

                    # building the report object of the last
                    report_dict = {**group_list[-1], **report_group['_id'], 'resource_uri': resource_uri}
                    
                    apicuron_db[apicuron_collection].insert_one(report_dict)

            elif len(revisions) > 0:
                report_dict = {
                    **revisions[0], **report_group['_id'], 'resource_uri': resource_uri}
                # if there is only one revision report, we insert that one
                apicuron_db[apicuron_collection].insert_one(report_dict)


        # delete all the database afterwards
        self.logger.info('deleting {} inserted records from the curation collection'.format(len(processed_document_ids)))

        curation_db[collection].delete_many({
            '_id':{
                '$in': list(processed_document_ids)
            }
        })
