import { PipelineStage } from 'mongoose';

export function achievements_v1_pipeline({
	orcid_filter = 'none',
	achievement,
	curator_name,
	resource,
	curator_orcid,
	sort_field,
	sort_value,
	page_size,
	filter_priority,
	page,
}: {
	orcid_filter?: string;
	achievement?: string;
	curator_name?: string;
	resource?: string;
	curator_orcid?: string;
	sort_field?: string;
	sort_value?: string;
	page_size?: string;
	filter_priority?: string;
	page?: string;
}): PipelineStage[] {
	let filter_pipeline = [];
	// builfing the filter pipeline
	if (!!curator_name) {
		filter_pipeline.push({
			$match: {
				$text: { $search: curator_name },
			},
		});
	}

	if (!!curator_orcid) {
		filter_pipeline.push({
			$match: {
				orcid_id: {
					$regex: `.*${curator_orcid}.*`,
					$options: 'i',
				},
			},
		});
	}

	// building the middle match object
	const mid_match_obj = [];

	if (!!achievement) {
		mid_match_obj.push({
			$match: {
				name: achievement,
			},
		});
	}

	if (!!resource) {
		mid_match_obj.push({
			$match: {
				resource_uri: {
					$regex: `.*${resource}.*`,
					$options: 'i',
				},
			},
		});
	}

	if (!!filter_priority) {
		mid_match_obj.push(
			{
				$sort: {
					score_relative: 1,
				},
			},
			{
				$group: {
					_id: {
						category: '$category',
						curator_orcid: '$curator_orcid',
						resource_uri: '$resource_uri',
						type: '$type',
					},
					medals: {
						$push: '$$ROOT',
					},
				},
			},
			{
				$set: {
					medals: {
						$cond: [
							{
								$eq: ['$_id.type', 'medal'],
							},
							{
								$arrayElemAt: ['$medals', 0],
							},
							'$medals',
						],
					},
				},
			},
			{
				$unwind: '$medals',
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ['$medals', '$$ROOT'],
					},
				},
			},
			{
				$project: {
					_id: 0,
					medals: 0,
				},
			},
		);
	}

	// building the pagination part of the pipeline
	// setting the sort_field, sort direction ans skip/limit values
	const column_list = ['entity_uri', 'name'];

	if (sort_field != '$total_score' && !column_list.includes(sort_field)) {
		sort_field = '$total_score';
	}

	const sort_direction = sort_value === 'asc' ? 1 : -1;
	const limit = !!page_size ? page_size : 10;
	const skip = !!page ? page : 0;

	let pagination_obj = [
		{
			$sort: {
				sort_field: sort_direction,
			},
		},
		{ $skip: skip },
		{ $limit: limit },
	];

	return filter_pipeline.concat(
		[
			{
				$match: {
					$or: [
						{
							orcid_id: orcid_filter,
						},
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
					from: 'achievements',
					let: {
						curator_orcid: '$curator_orcid',
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: ['$curator_orcid', '$$curator_orcid'],
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
				$unwind: '$achievements',
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ['$achievements', '$$ROOT'],
					},
				},
			},
			{
				$project: {
					achievements: 0,
				},
			},
		],
		mid_match_obj,
		pagination_obj,
	);
}
