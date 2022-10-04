import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './transform.interceptor';
import { TransformerService } from './transformer.service';

@Module({
	providers: [
		TransformerService,
		{
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
	],
	exports: [TransformerService],
})
export class TransformerModule {}
