
from importlib import resources
from io import FileIO

from datetime import datetime

from requests import delete
from database_tasks.tasks.task import Task
import ijson
from database_tasks.util.database import Database


class SubmitReport(Task):

    name= 'submit_report'

    description = 'Task that submits a report or multiple reports'


    def build_submission_report (self):
        """
        Function that builds the notification body that APICURON uses to determine
        """
        missing_fields_text = '\n'.join([str(x) for x in self.missing_fields_list])
        validation_error_text = '\n'.join([str(x) for x in self.validation_error_cases])
        output = f"{self.insert_count} documents successfully inserted\n"
        if self.missing_fields_count > 0:
            output += f"{self.missing_fields_count} documents with missing fields:\n{missing_fields_text}\n"
        if self.insert_error_count > 0:
            output += f"{self.insert_error_count} documents with insert errors\n"
        if self.validation_error_count > 0:
            output += f"{self.validation_error_count} documents with validation errors !\n{validation_error_text}"
        return output
    
    def __init__(self):
        super().__init__()
        self.report_fields = {'timestamp', 'curator_orcid', 'entity_uri', 'activity_term', 'resource_id'}
        self.insert_count = 0
        self.missing_fields_count = 0
        self.insert_error_count = 0
        self.missing_fields_list = []
        self.validation_error_cases = []
        self.validation_error_count = 0
        self.users_coll = Database.apicuron_db['users']
        self.resources_coll = Database.apicuron_db['resources_def']
        self.notification_coll = Database.apicuron_db['notifications']
        self.reports_coll = Database.apicuron_db['reports']
        

    def setup_resources_dict(self, orcid_id: str):
        
        
        user = self.users_coll.find_one({ 'orcid_id': orcid_id })
        resource_ids = [resource['resource_id'] for resource in user['resources']]
        resource_cursor = self.resources_coll.find({ 'resource_id': { '$in': resource_ids }}, ['resource_id', 'resource_uri'])

        resource_dict = {resource['resource_id']: resource['resource_uri'] for resource in resource_cursor }

        self.resources_dict = resource_dict

    
    def _build_default_report(self, f:FileIO, orcid_id: str):
        """
        Function that builds the default report that is based on the top level fields
        of the reports json file
        """
        default_report_dict = {}
        for field in self.report_fields:
            if any(ijson.items(f, field)):
                f.seek(0)
                default_report_dict[field] = next(ijson.items(f, field))
                self.logger.info(f'Found global field "{field}" with value {default_report_dict[field]}')
            f.seek(0)
        f.seek(0)

        if 'resource_id' in default_report_dict:
            if default_report_dict['resource_id'] not in self.resources_dict:
                self.notification_coll.insert_one({
                    'title': 'report submission Failed',
                    'created_at': datetime.now(),
                    'orcid_id': orcid_id,
                    'body': f'Report submission failed due to wrong resource_id "{default_report_dict["resource_id"]}"'
                })
                raise Exception(f'Submission failed due to to wrong resource_id "{default_report_dict["resource_id"]}"')
            

        return default_report_dict


    def _validate_report(self, report:dict):
        
        fields_difference = self.report_fields.difference(set(report.keys()))

        output = True

        if fields_difference:
            self.logger.info(f'Document has insufficient fields, missing fields are {fields_difference}')
            self.missing_fields_count += 1
            self.missing_fields_list.append(report)
            output = False
            
        if report['resource_id'] not in self.resources_dict:
            self.validation_error_count += 1
            self.validation_error_cases.append(
                ('Invalid resource_id !', report)
            )
            output = False
        
        else:
            report['resource_uri'] = self.resources_dict[report['resource_id']]
        
        return output

    def exec_task(self, orcid_id=None, delete_all='', *args, **kwargs):

        # setup the resources dictionary to add resource_uri to the entries
        self.setup_resources_dict(orcid_id)

        # initializing the count of the inserted_reports
        inserted_reports_count = 0

        # list of resources to delete from
        del_resources = delete_all.split(',')
        for res_id in del_resources:
            if res_id in self.resources_dict:
                self.reports_coll.delete_many({
                    '$or': [
                        { 'resource_id': res_id },
                        { 'resource_uri': self.resources_dict[res_id]}
                    ]
                })

        
        
        # get the reports file name
        file_name = kwargs['file']
        
        f = open(file_name, 'r')
        
        default_report_dict = self._build_default_report(f, orcid_id)

        # remaining_fields = self.report_fields  - default_report_dict.keys()
        
        for report in ijson.items(f, 'reports.item'):
            # entry = {}
            # for field in remaining_fields:
            #     if field in report:
            #         entry[field] = report.get(field, None)

            result = {**default_report_dict, **report}
                        
            
            if not self._validate_report(result):
                continue

            else:
                try:
                    result = self.reports_coll.insert_one(result)
                    self.insert_count+= 1
                except Exception as e:
                    self.logger.error(f"Error encountered when inserting document {result}")
                    self.logger.error(f'Error: {e} \n {e.stack}')
                    self.insert_error_count += 1
                else:
                    inserted_reports_count += 1

        self.notification_coll.insert_one({
            'orcid_id': orcid_id,
            'title': 'Submission report',
            'created_at': datetime.now(),
            'body': self.build_submission_report(),
            'seen': False
        })
                    
            
        f.close()
        

        
        
        
