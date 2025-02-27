import { Pipe, PipeTransform } from "@angular/core";
import { environment } from "src/environments/environment";


@Pipe({
	name: 'orcidToUrl',
})
export class OrcidToUrl implements PipeTransform {
	transform(value: string) {
		return new URL(value, environment.orcid_main_url).href;
	}

}