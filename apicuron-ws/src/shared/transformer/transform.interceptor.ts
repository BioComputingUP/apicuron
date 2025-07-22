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
					const wrappedResponse = { ...response, ...meta };
					return wrappedResponse;
				} else {
					// if the response is not wrapped, wrap it
					// this assignment approach guarantees that the resulting object is a Pojo
					// and not an instance of a class
					const wrappedResponse = Object.create(null);
					Object.assign(wrappedResponse, { data: response }, meta);
					return wrappedResponse;
				}
				// the parenthesis are essential
				// it means we're returning a function that returns the data
				// don't return a different object,
				// Rxjs doesn't like when the object reference changes
			}),
		);
	}
}
