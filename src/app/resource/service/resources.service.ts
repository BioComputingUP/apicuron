import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, pluck } from "rxjs/operators";
import { Resource } from "src/app/models/resource.model";
import { environment } from "src/environments/environment";



@Injectable()
export class ResourcesService {
    constructor(protected http: HttpClient) { }

    partnerResourcesPath = environment.ws + "/partner-resources";

    get_resource(resource_id: string) {
        const response = this.http.get(
            `${this.partnerResourcesPath}/${resource_id}`,
            {
                responseType: "json",
                headers: {
                    version: "2",
                },
            }
        );
        return response.pipe(
            pluck('data'),
            map((resource: Resource) => {
                return new Resource().deserialize(resource)
            })
        )
    }
}