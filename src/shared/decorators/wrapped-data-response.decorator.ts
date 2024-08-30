import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { Type, applyDecorators } from '@nestjs/common';

export const ApiResponseWrapped = <
	DataDto extends Type<unknown> | [Type<unknown>],
>(
	dataDto: DataDto,
	status = 200,
	description = 'Returns Wrapped Response in data property',
) => {
	if (Array.isArray(dataDto)) {
		return applyDecorators(
			ApiExtraModels(dataDto[0]),
			ApiResponse({
				description,
				status,
				schema: {
					allOf: [
						{
							properties: {
								data: {
									type: 'array',
									items: {
										$ref: getSchemaPath(dataDto[0]),
									},
								},
							},
						},
					],
				},
			}),
		);
	}
	return applyDecorators(
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
};
