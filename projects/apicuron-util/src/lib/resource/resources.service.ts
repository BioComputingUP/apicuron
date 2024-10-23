import { Injectable } from "@angular/core";
import { environment } from "../../../../../src/environments/environment";
import { Observable, of } from "rxjs";
import { Resource } from "../../../../../src/app/models/resource.model";
import { HttpClient } from "@angular/common/http";
import { map, pluck, shareReplay } from "rxjs/operators";

@Injectable()
export class ResourcesService {
  constructor(private http: HttpClient) {}
  private partnerResourcesPath = environment.ws + "/partner-resources";

  get_resource(resource_id: string): Observable<{ data: Resource }> {
    const response = this.http.get<{ data: Resource }>(
      `${this.partnerResourcesPath}/${resource_id}`,
      {
        responseType: "json",
        headers: {
          version: "2",
        },
      }
    );

    const instance$ = response.pipe(
      map(({ data }) => ({ data: new Resource().deserialize(data) }))
    );
    return instance$;
  }

  loadResource(resourceInput: Resource | string): Observable<Resource> {
    if (
      typeof resourceInput != "string" &&
      !(resourceInput instanceof Resource)
    ) {
      throw new Error(
        `Invalid resource input: ${resourceInput}, input has to be either a string or a Resource object`
      );
    }
    if (typeof resourceInput === "string") {
      return this.get_resource(resourceInput).pipe(
        shareReplay(1),
        pluck("data")
      );
    }
    if (resourceInput instanceof Resource) {
      return of(resourceInput);
    }
  }
}
