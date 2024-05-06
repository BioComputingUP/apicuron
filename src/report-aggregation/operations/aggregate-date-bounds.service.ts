import { Injectable } from '@nestjs/common';
import { PipelineStage } from 'mongoose';
import { Operation } from '../interfaces/operations.interface';

@Injectable()
export class AggregateDateBoundsService implements Operation {
	map(): PipelineStage[] {
		return [];
	}

	group(): PipelineStage.Group['$group'] {
		return {
			last_contribution: {
				$min: '$timestamp',
			},
			first_contribution: {
				$max: '$timestamp',
			},
		};
	}

	postGroup(): PipelineStage[] {
		return [];
	}
}
