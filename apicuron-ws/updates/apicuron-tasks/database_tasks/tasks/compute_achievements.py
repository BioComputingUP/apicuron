from copy import copy
from itertools import islice
from pprint import pprint
from time import time
from database_tasks.tasks.aggregations.medal_reports import medal_reports_aggregation
from database_tasks.tasks.task import Task
from database_tasks.util.database import Database



class ComputeAchievements(Task):

    name = 'compute_achievements'

    description = 'Task that computes achievements for either an entire resource (medals and badges) or for a single user (badges)\n\t, Accepts resource_id and optional orcid_id as arguments'

    def exec_task(self, resource_id, orcid_id=None, **kwargs):

        if resource_id is None:
            self.logger.error('resource_id not supplied in the arguments')
            raise Exception('resource_id not supplied in the arguments')

        self.resource_coll = Database.apicuron_db['resources_def']
        self.user_coll = Database.apicuron_db['users']
        self.reports_coll = Database.apicuron_db['reports']
        self.achievements_def_coll = Database.apicuron_db['achievements_def']
        self.achievements_coll = Database.apicuron_db['achievements']

        resource = self.resource_coll.find_one({
            'resource_id': resource_id,
            'state':'PartnerResource'
        })

        if resource is None:
            self.logger.error(
                f'Partner Resource {resource_id} not found in database')
            raise Exception(
                f'Partner Resource {resource_id} not found in Database')

        if orcid_id is None:

            self.logger.info(f'Computing stats for {resource_id}')
            self.compute_achievements_resource(resource)
        else:
            user = self.user_coll.find_one({
                'orcid_id': orcid_id
            })

            if user is None:
                self.logger.error(f'orcid {orcid_id} not found in database')
                raise Exception(f'orcid {orcid_id} not found in Database')

            self.logger.info(
                f'Computing stats for user {orcid_id} at the resource {resource_id}')
            self.compute_user_badges(resource, user)

    def compute_achievements_resource(self, resource):
        self.compute_badges_resource(resource)
        self.compute_medals_resource(resource)

    def compute_badges_resource(self, resource):
        self.achievements_coll.delete_many({
            'resource_id': resource['resource_id'],
            'resource_uri': resource['resource_uri']
        })
        print(resource['resource_id'])
        badges = self.achievements_def_coll.find({
            'resource_id': resource['resource_id'],
            'type': 'badge'
        })

        badges_list = list(badges)

        # this query groups reports by user and activity_terms
        # computes the count of each term creating a list of (term, count) pairs
        user_reports = self.reports_coll.aggregate(
            [
                {
                    '$match': {
                        'resource_id': resource['resource_id']
                    }
                },
                {
                    '$group': {
                        '_id': {
                            'curator_orcid': '$curator_orcid',
                            # 'resource_uri': '$resource_uri',
                            'activity_term': '$activity_term'
                        },
                        'count': {
                            '$sum': 1
                        },
                        'activity_term': {
                            '$first': '$activity_term'
                        },
                        'curator_orcid': {
                            '$first': '$curator_orcid'
                        }
                    }
                },
                {
                    '$group': {
                        '_id': {
                            'curator_orcid': '$curator_orcid'
                        },
                        'terms': {
                            '$addToSet': {
                                'activity_term': '$activity_term',
                                'count': '$count'
                            }
                        }
                    }
                }
            ])

        achievement_list = []
        # for each user contributions
        for user in user_reports:
            # for each badge belonging to the resource
            for badge in badges_list:
                # get the list of user contributions that are concerned by the current badge
                user_concerned_terms = filter(
                    lambda term: term['activity_term'] in badge['list_terms'], user['terms'])
                # compute their sum to get the total number of contributions related to the current badge
                user_count = sum(term['count']
                                 for term in user_concerned_terms)

                # if the number is higher we
                if user_count >= badge['count_threshold']:
                    achievement = {**badge, 'count': user_count,
                                   'curator_orcid': user['_id']['curator_orcid']}
                    del achievement['_id']
                    del achievement['list_terms']
                    achievement_list.append(achievement)

            if len(achievement_list) > 40:
                results = self.achievements_coll.insert_many(achievement_list)
                self.logger.info('Pushed {} badges'.format(
                    len(results.inserted_ids)))
                achievement_list = []

        if len(achievement_list) > 0:
            results = self.achievements_coll.insert_many(achievement_list)
            self.logger.info('Pushed {} badges '.format(
                len(results.inserted_ids)))

    def compute_medals_resource(self, resource):

        # delete previous medals for this resource
        self.achievements_coll.delete_many({
            'resource_id': resource['resource_id'],
            'type': 'medal'
        })
        
        # get medals definition
        medals = self.achievements_def_coll.find({
            'resource_id': resource['resource_id'],
            'type': 'medal'
        })
        
        # initialize the achievements list buffer
        achievements = []

        # for each medal we request the user curation_information
        for medal in medals:

            user_reports = self.reports_coll.aggregate(
                medal_reports_aggregation(medal))

            self.logger.info(f'Processing Medal {medal["name"]}')
            # for each n first reports where n is the score_relative
            # we add the medals to the users
            for index, user_report in enumerate(islice(user_reports, medal['score_relative'])):
                self.logger.info(f'\tMedal received by user {user_report["_id"]["curator_orcid"]} ')

                # build the achievement document
                achievement = {
                    **medal,
                    'curator_orcid': user_report["_id"]["curator_orcid"],
                    'count_total': user_report['count'],
                    'score_total': user_report['score_sum'],
                    'score_relative_index': index
                }

                # removing unnecessary properties
                del achievement['_id']
                del achievement['list_terms']
                if achievement.get('first_day'):
                    del achievement['first_day']
                if achievement.get('last_day'):
                    del achievement['last_day']
                
                # add to the list 
                achievements.append(achievement)
                
                # if list buffer exceeds a certain amount, we push the achievements
                if len(achievements) >= 40:
                    self.achievements_coll.insert_many(achievements)
                    achievements = []
        if len(achievements) > 0:
            self.achievements_coll.insert_many(achievements)

    def compute_user_badges(self, resource, user):
        badges_def = self.achievements_def_coll.find({
            'resource_id': resource['resource_id'],
            'type': 'badge'
        })

        badges_list = list(badges_def)

        user_reports = self.reports_coll.find({
            'resource_id': resource['resource_id'],
            'curator_orcid': user['orcid_id']
        })

        for report in user_reports:
            term = report['activity_term']
            for badge in badges_list:
                if term in badge['list_terms']:
                    badge['count'] = badge.get('count', 0) + 1

        # filtering badges with a count higher than threshold
        obtained_badges = list(filter(lambda badge: badge.get(
            'count', 0) > badge['count_threshold'], badges_list))

        for badge in obtained_badges:
            badge['count'] = badge.get('count', 0)
            badge['curator_orcid'] = user['orcid_id']

        self.achievements_coll.delete_many({
            'curator_orcid': user['orcid_id'],
            'resource_id': resource['resource_id']
        })

        result = self.achievements_coll.insert_many(obtained_badges)

        self.logger.info(
            f'computed {len(result.inserted_ids)} badges For user {user["orcid_id"]}')
