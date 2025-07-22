

def group_reports_user(resource_id: str, orcid_id: str):

    return [
        # only reports from user
        {
            '$match': {
                'curator_orcid': orcid_id,
                'resource_id': resource_id
            }
        },
        # lookup the terms to get the activity_category, name, description and score
        {
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
        },
        # after the lookup and cleaning the results
        # we group the data by activity_terms
        # and we compute the score sum and count of each activity_term
        {
            '$group': {
                '_id': '$activity_term',
                'sum': {
                    '$sum': '$score'
                },
                'score': {
                    '$first': '$score'
                },
                'count': {
                    '$sum': 1
                },
                'activity_name': {
                    '$first': '$activity_name'
                },
                'description': {
                    '$first': '$description'
                },
                'activity_category': {
                    '$first': '$activity_category'
                }
            }
        }
    ]
