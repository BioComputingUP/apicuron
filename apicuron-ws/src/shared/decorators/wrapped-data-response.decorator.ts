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
		const firstDto = dataDto[0] as Type<unknown>;
		return applyDecorators(
			ApiExtraModels(firstDto),
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
										$ref: getSchemaPath(firstDto),
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
