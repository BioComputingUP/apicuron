import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable()
export class CuratorRegistryService {
	private wsUrl = environment.ws;

	constructor(private httpClient: HttpClient) {}

	getAllCurators() {
		return this.httpClient.get(this.wsUrl + "/registry", {
			headers: {
				version: "2",
			}
		});
	}
}