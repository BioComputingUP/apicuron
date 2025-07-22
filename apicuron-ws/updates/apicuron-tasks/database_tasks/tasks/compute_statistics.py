from database_tasks.tasks.aggregations.group_reports_user import group_reports_user
from database_tasks.tasks.task import Task
from database_tasks.util.database import Database


class ComputeStatisticsTask(Task):

    name = 'compute_statistics'

    description = 'Computes the user and resource statistics of the users'

    def exec_task(self, resource_id=None, orcid_id=None, **kwargs):
        if resource_id is None:
            self.logger.error('resource_id not supplied in the arguments')
            raise Exception('resource_id not supplied in the arguments')
        
        self.logger.info(f'For Resource {resource_id}')
        self.resource_coll = Database.apicuron_db['resources_def']
        self.user_coll = Database.apicuron_db['users']
        self.reports_coll = Database.apicuron_db['reports']
        self.achievements_def_coll = Database.apicuron_db['achievements_def']
        self.achievements_coll = Database.apicuron_db['achievements']
        self.terms_def_coll = Database.apicuron_db['terms_def']
        self.statistics_coll = Database.apicuron_db['statistics']

        resource = self.resource_coll.find_one(
            {'resource_id': resource_id, 'state': 'PartnerResource'})

        if orcid_id is None:
            self.compute_resource_statstics(resource)
        else:
            user = self.user_coll.find_one({
                'orcid_id': orcid_id,
            })
            self.compute_user_statistics(resource, user)

    # compute entire resource stats
    def compute_resource_statstics(self, resource: dict):

        user_reports = self.reports_coll.aggregate([
            {
                '$match': {
                    'resource_id': resource['resource_id']
                }
            }, {
                '$group': {
                    '_id': {
                        'curator_orcid': '$curator_orcid',
                        'activity_term': '$activity_term'
                    },
                    'count': {
                        '$sum': 1
                    },
                    'curator_orcid': {
                        '$first': '$curator_orcid'
                    },
                    'activity_term': {
                        '$first': '$activity_term'
                    }
                }
            }, {
                '$lookup': {
                    'from': 'terms_def',
                    'localField': 'activity_term',
                    'foreignField': 'activity_term',
                    'as': 'term'
                }
            }, {
                '$unwind': {
                    'path': '$term'
                }
            }, {
                '$set': {
                    'activity_category': '$term.activity_category',
                    'score': '$term.score',
                    'activity_name': '$term.activity_name',
                    'description': '$term.description'
                }
            }, {
                '$group': {
                    '_id': '$curator_orcid',
                    'terms': {
                        '$addToSet': {
                            'count': '$count',
                            'activity_term': '$activity_term',
                            'activity_category': '$activity_category',
                            'score': '$score',
                            'description': '$description',
                            'activity_name': '$activity_name'
                        }
                    },
                    'total_score': {
                        '$sum': {'$multiply': ['$count', '$score']}
                    }
                }
            },
            {
                '$sort': {'total_score': -1}
            }
        ])

        for index, user_report in enumerate(user_reports, 1):

            for term in user_report['terms']:
                term['sum'] = term['score'] * term['count']

            stat_dict = {
                'resource_id': resource['resource_id'],
                'resource_uri': resource['resource_uri'],
                'total_score': user_report['total_score']
            }
            stat_dict['generation_terms'] = list(filter(
                lambda term: term['activity_category'] == 'generation', user_report['terms']))
            stat_dict['revision_terms'] = list(filter(
                lambda term: term['activity_category'] == 'revision', user_report['terms']))
            stat_dict['invalidation_terms'] = list(filter(
                lambda term: term['activity_category'] == 'invalidation', user_report['terms']))

            stat_dict['generation_count'] = sum(
                [term['count'] for term in stat_dict['generation_terms']])
            stat_dict['revision_count'] = sum(
                [term['count'] for term in stat_dict['revision_terms']])
            stat_dict['invalidation_count'] = sum(
                [term['count'] for term in stat_dict['invalidation_terms']])

            stat_dict['generation_score'] = sum(
                [term['sum'] for term in stat_dict['generation_terms']])
            stat_dict['revision_score'] = sum(
                [term['sum'] for term in stat_dict['revision_terms']])
            stat_dict['invalidation_score'] = sum(
                [term['sum'] for term in stat_dict['invalidation_terms']])

            stat_dict['ranking'] = index

            stat_dict['badges_count'] = self.achievements_coll.count_documents({
                'type': 'badge',
                'curator_orcid': user_report['_id'],
                '$or': [
                    {'resource_uri': resource['resource_uri']},
                    {'resource_id': resource['resource_id']}
                ]
            })

            stat_dict['medals_count'] = self.achievements_coll.count_documents({
                'type': 'medal',
                'curator_orcid': user_report['_id'],
                '$or': [
                    {'resource_uri': resource['resource_uri']},
                    {'resource_id': resource['resource_id']}
                ]
            })

            user_update = self.user_coll.update_one(
                {'orcid_id': user_report['_id'], 'stats': {
                    '$elemMatch': {'resource_id': resource['resource_id']}}},
                {'$set':  {'stats.$': stat_dict}}
            )
            self.logger.info(
                f'updated user {user_report["_id"]}, matched_count: {user_update.matched_count}, modified count {user_update.modified_count}')
            
            self.logger.info(f'stat object has resource_id {resource["resource_id"]}')
            stats_replace = self.statistics_coll.replace_one({
                'curator_orcid': user_report['_id'],
                '$or': [
                    {'resource_id': resource['resource_id']},
                    {'resource_uri': resource['resource_uri']},
                ]
            },
            {
                'curator_orcid': user_report['_id'],
                **stat_dict
            },
                upsert=True)

            self.logger.info(
                f'updated user {user_report["_id"]}, matched_count: {stats_replace.matched_count}, modified count {user_update.modified_count}')

    def compute_user_statistics(self, resource: dict, user: dict):

        user_reports = self.reports_coll.aggregate(
            group_reports_user(resource['resource_id'], user['orcid_id']))

        stat_dict = {
            'generation_terms': [],
            'revision_terms': [],
            'invalidation_terms': [],
            'generation_count': 0,
            'revision_count': 0,
            'invalidation_count': 0,
            'generation_score': 0,
            'revision_score': 0,
            'invalidation_score': 0,
        }
        total_score = 0
        for report in user_reports:
            activity_category = report['activity_category']
            stat_dict[f'{activity_category}_terms'].append(
                {**report, 'resource_id': resource['resource_id'], 'resource_uri': resource['resource_uri']})
            stat_dict[f'{activity_category}_count'] += 1
