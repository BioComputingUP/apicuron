

def medal_reports_aggregation(medal):
    # first we first filter all the reports by the resource
    # and the terms that are concerned by the medals 
    match_dict = {
        'resource_id': medal['resource_id'],
        'activity_term': {
            '$in': medal['list_terms']
        }
        
    }

    # if the medal has a time constraint we make sure it's added to the filter
    if 'first_day' in medal:
        match_dict['timestamp'] = { '$gte': medal['first_day'] }
    
    if 'last_day' in medal:
        # if the timestamp object doesn't exist, it is created otherwise it is updated
        if match_dict.get('timestamp') is None:
            match_dict['timestamp'] = { '$lte': medal['last_day'] }
        else:
            match_dict['timestamp']['$lte'] = medal['last_day']
    


    return [
        {
            '$match': match_dict
        },
            # here we lookup and unwind from the terms_def collection to get the term score
        {
            '$lookup': {
                'from': 'terms_def',
                'localField': 'activity_term',
                'foreignField': 'activity_term',
                'as': 'result'
            }
        }, {
            '$unwind': {
                'path': '$result'
            }
        }, {
            '$project': {
                'curator_orcid': 1,
                'activity_term': 1,
                'score': '$result.score'
            }
        },
        # here we group by curator while computing the count ans score sum
        {
            '$group': {
                '_id': {
                    'curator_orcid': '$curator_orcid'
                },
                'count': {
                    '$sum': 1
                },
                'score_sum': {
                    '$sum': '$score'
                }
            }
        },
        # and we sort the output in decreasing order based on the score_sum
        {
            '$sort': {
                'score_sum': -1
            }
        }
    ]


