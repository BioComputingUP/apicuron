
from pymongo.database import Database


def get_resources_dict(db: Database):
    resources_list = db['resources_def'].find(
        {'$or': [ {'state': 'PartnerResource'}, { 'state': {'$exists': False }}]}, ['resource_id', 'resource_uri'])

    resources_dict = {}

    for resource in resources_list:
        resources_dict[resource['resource_uri']] = resource['resource_id']

    return resources_dict
