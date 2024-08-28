import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { Type, applyDecorators } from '@nestjs/common';

export const ApiResponseWrapped = <DataDto extends Type<unknown>>(
	dataDto: DataDto,
	status = 200,
	description = 'Returns Wrapped Response in data property',
) =>
	applyDecorators(
		ApiExtraModels(dataDto),
		ApiResponse({
			description,
			status,
			schema: {
				allOf: [
					{
						properties: {
							data: {
								$ref: getSchemaPath(dataDto),
							},
						},
					},
				],
			},
		}),
	);
