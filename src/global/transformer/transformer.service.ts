import { Injectable, Scope, Logger, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
@Injectable({
	scope: Scope.TRANSIENT,
})
export class TransformerService {

	constructor(@Inject(REQUEST) protected request) {
		this.request.meta_attributes = {}
		this.request.warnings = {}
	}
	// private warnings = {};
	// private meta_attributes = {};
	private transformerServiceLogger = new Logger(TransformerService.name);

	warn(key: string, msg: string): void {
		let warnings = this.request.warnings;
		warnings[key] = key in warnings ? [...warnings[key], msg] : [msg];
		this.request.warnings = warnings;
	}

	append_meta(key: string, value: any, overwrite?: Boolean) {
		if (key in this.request.meta_attributes && !overwrite) {
			this.transformerServiceLogger.warn(
				`Attempt to overwrite attribute ${key} without specifiying it !! \nSet overwrite to true if that is necessary`,
			);
            this.transformerServiceLogger.warn(`attribute addition aborted !!!`)
			return;
		}
		this.request.meta_attributes[key] = value;
	}
    

	generate_reponse(data: object) {
		let meta = this.request.meta_attributes;

        if(Object.keys(this.request.warnings).length > 0){
			meta['warnings'] = this.request.warnings
        }

		console.log('meta', meta)

        return {data, ...meta}
	}
}
