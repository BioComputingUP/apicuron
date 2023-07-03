import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { map, pluck } from "rxjs/operators";
import { Resource } from "src/app/models/resource.model";
import { environment } from "src/environments/environment";



@Injectable()
export class ResourcesService {
    constructor(protected http: HttpClient) { }

    partnerResourcesPath = environment.ws + "/partner-resources";

    get_resource(resource_id: string): Observable<Resource> {
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


    getResources(resource_ids: string[]): Observable<Resource[]>{
        const resources$: Observable<Resource>[] = resource_ids.map((resource_id) => {
            return this.get_resource(resource_id)
        })
        return combineLatest(resources$)
    }
}