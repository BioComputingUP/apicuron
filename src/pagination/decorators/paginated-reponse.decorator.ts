import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { Paginated } from '../paginator';
import { Type, applyDecorators } from '@nestjs/common';

export const ApiResponsePaginated = <DataDto extends Type<unknown>>(
	dataDto: DataDto,
	status = 200,
	description = 'Returns Paginated Response',
) =>
	applyDecorators(
		ApiExtraModels(Paginated, dataDto),
		ApiResponse({
			description,
			status,
			schema: {
				allOf: [
					{ $ref: getSchemaPath(Paginated) },
					{
						properties: {
							data: {
								type: 'array',
								items: { $ref: getSchemaPath(dataDto) },
							},
						},
					},
				],
			},
		}),
	);
