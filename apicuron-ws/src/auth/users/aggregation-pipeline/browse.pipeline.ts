import { PipelineStage } from 'mongoose';

export function browse_v1_pipeline({
	curator_name,
	orcid_id: curator_orcid,
	orcid_filter,
	achievements,
	resource_uri,
	sort_field = '$total_score',
	sort_value,
	page_size,
	page,
}: {
	curator_name?: string;
	orcid_id?: string;
	orcid_filter?: string;
	resource_uri?: string;
	achievements?: string | Array<string>;
	sort_field?: string;
	sort_value?: string;
	page_size?: number;
	page?: number;
}): PipelineStage[] {
	// building the first match object of the aggregation pipeline
	// curator_name filter

	const first_match_obj = {};
	if (!!curator_name) {
		first_match_obj['full_name'] = {
			$regex: `.*${curator_name}.*`,
			$options: 'i',
		};
	}
	if (!!curator_orcid) {
		first_match_obj['orcid_id'] = {
			$regex: `.*${curator_orcid}.*`,
			$options: 'i',
		};
	}

	// building the match object in the middle of the aggregation pipeline
	let achievements_filter: any = achievements;
	if (Array.isArray(achievements) && achievements.length > 0) {
		achievements_filter = {
			$all: achievements,
		};
	}
	let mid_match_obj = {};

	if (!!achievements) {
		mid_match_obj['badges_medals'] = achievements_filter;
	}
	if (!!resource_uri) {
		mid_match_obj['resource_uri'] = {
			$regex: `.*${resource_uri}.*`,
			$options: 'i',
		};
	}

	// setting the sort_field, sort direction ans skip/limit values
	const column_list = [
		'curator_orcid',
		'family_name',
		'given_name',
		'total_score',
		'generation_count',
		'revision_count',
		'invalidation_count',
		'generation_score',
		'revision_score',
		'invalidation_score',
		'badges_count',
		'medals_count',
		'ranking',
	];

	if (sort_field != '$total_score' && !column_list.includes(sort_field)) {
		sort_field = '$total_score';
	}

	const sort_direction = sort_value === 'asc' ? 1 : -1;
	const limit = !!page_size ? page_size : 10;
	const skip = !!page ? page : 0;

	return [
		{
			$match: {
				$and: [
					first_match_obj,
					{
						hide: {
							$exists: false,
						},
					},
				],
			},
		},
		{
			$project: {
				_id: 0,
				curator_orcid: '$orcid_id',
				full_name: 1,
				given_name: 1,
				family_name: 1,
			},
		},

		{
			$lookup: {
				from: 'statistics',
				localField: 'curator_orcid',
				foreignField: 'curator_orcid',
				as: 'resources',
			},
		},
		{
			$unwind: {
				path: '$resources',
			},
		},
		{
			$replaceRoot: {
				newRoot: {
					$mergeObjects: ['$resources', '$$ROOT'],
				},
			},
		},
		{
			$project: {
				resources: 0,
			},
		},
		{
			$lookup: {
				from: 'achievements',
				let: {
					curator_orcid: '$curator_orcid',
					resource_uri: '$resource_uri',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{
										$eq: ['$curator_orcid', '$$curator_orcid'],
									},
									{
										$eq: ['$resource_uri', '$$resource_uri'],
									},
								],
							},
						},
					},
					{
						$project: {
							_id: 0,
						},
					},
				],
				as: 'achievements',
			},
		},

		{
			$addFields: {
				badges_medals: '$achievements.name',
			},
		},
		{
			$match: mid_match_obj,
		},
		{
			$project: {
				badges_medals: 0,
				_id: 0,
			},
		},
		{
			$project: {
				achievements: 0,
				full_name: 0,
			},
		},
		{
			$group: {
				_id: {
					curator_orcid: '$curator_orcid',
					family_name: '$family_name',
					given_name: '$given_name',
				},
				total_score: {
					$sum: '$total_score',
				},
				generation_count: {
					$sum: '$generation_count',
				},
				revision_count: {
					$sum: '$revision_count',
				},
				invalidation_count: {
					$sum: '$invalidation_count',
				},
				generation_score: {
					$sum: '$generation_score',
				},
				revision_score: {
					$sum: '$revision_score',
				},
				invalidation_score: {
					$sum: '$invalidation_score',
				},
				badges_count: {
					$sum: '$badges_count',
				},
				medals_count: {
					$sum: '$medals_count',
				},
				resources: {
					$push: '$$ROOT.resource_uri',
				},
			},
		},
		{
			$addFields: {
				curator_orcid: '$_id.curator_orcid',
				family_name: '$_id.family_name',
				given_name: '$_id.given_name',
				type: 'stat_total',
			},
		},
		{
			$project: {
				_id: 0,
			},
		},
		{
			$sort: {
				total_score: -1,
			},
		},

		{
			$group: {
				_id: { type: '$type' },
				biourators: {
					$push: '$$ROOT',
				},
			},
		},

		{
			$project: {
				biourators: {
					$map: {
						input: { $range: [0, { $size: '$biourators' }] },
						as: 'index',
						in: {
							$mergeObjects: [
								// we join two documents
								{ $arrayElemAt: ['$biourators', '$$index'] },
								{ ranking: { $add: ['$$index', 1] } },
							],
						},
					},
				},
			},
		},
		{
			$unwind: {
				path: '$biourators',
			},
		},

		{
			$replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', '$biourators'] } },
		},
		{
			$project: {
				biourators: 0,
				type: 0,
			},
		},

		{
			$addFields: {
				sorting_field: sort_field,
			},
		},
		{
			$project: {
				_id: 0,
			},
		},
		{
			$facet: {
				total: [{ $count: 'biocurators_count' }],
				biocurators: [
					{ $sort: { sorting_field: sort_direction } },
					{ $skip: skip },
					{ $limit: limit },
					{
						$project: {
							sorting_field: 0,
						},
					},
				],
			},
		},
		{
			$replaceRoot: {
				newRoot: {
					$mergeObjects: [{ $arrayElemAt: ['$total', 0] }, '$$ROOT'],
				},
			},
		},
		{
			$project: {
				total: 0,
			},
		},
		{
			$set: {
				biocurators_count: {
					$ifNull: ['$biocurators_count', 0],
				},
			},
		},
	];
}
