import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { map, pluck, shareReplay } from "rxjs/operators";
import { Resource } from "src/app/models/resource.model";
import { environment } from "src/environments/environment";

@Injectable()
export class ResourcesService {
  constructor(protected http: HttpClient) {}

  partnerResourcesPath = environment.ws + "/partner-resources";


  getAllResources(): Observable<Resource[]> {
    return this.http.get(this.partnerResourcesPath, {
      responseType: "json",
      headers: {
        version: "2"
      }
    }).pipe(
      pluck('data'),
      map((resources: Resource[]) => {
        return resources.map(resource => new Resource().deserialize(resource));
      })
    )
    
  }

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
      pluck("data"),
      map((resource: Resource) => {
        return new Resource().deserialize(resource);
      })
    );
  }

  getResources(resource_ids: string[]): Observable<Resource[]> {
    const resources$: Observable<Resource>[] = resource_ids.map(
      (resource_id) => {
        return this.get_resource(resource_id);
      }
    );
    return combineLatest(resources$);
  }

  updateResource(resource: Resource, logo?: File) {
    const formData = new FormData();

    for (const key of Object.keys(resource.serialize())) {
      const value = resource[key];
      formData.set(key, value);
    }
    if(logo){
      formData.set('logo', logo);
    }

    const data = this.http.put(this.partnerResourcesPath, formData, {
      responseType: "json",
      headers: {
        version: "2",
      },
    });

    return data;
  }
}
