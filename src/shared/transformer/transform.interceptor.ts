import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { TransformerService } from './transformer.service';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest();
		if (req.get('version') != '2') {
			return next.handle();
		}
		return next.handle().pipe(
			map((response) => {
				// return
				// return x
				const req = context.switchToHttp().getRequest();
				const meta: object = req.meta_attributes || {};
				if (req.warnings && Object.keys(req.warnings).length > 0) {
					meta['warnings'] = req.warnings;
				}
				if (!!response && typeof response == 'object' && 'data' in response) {
					return { ...response, ...meta };
				} else {
					return { data: response, ...meta };
				}
				// the parenthesis are essential
				// it means we're returning a function that returns the data
				// don't return a different object,
				// Rxjs doesn't like when the object reference changes
				// and acts weird when it does (I don't like how object.assign looks either)
				// return Object.assign(data, {meta})
			}),
		);
	}
}
