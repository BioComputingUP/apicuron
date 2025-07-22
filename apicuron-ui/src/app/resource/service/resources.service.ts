import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, combineLatest, of } from "rxjs";
import { map, pluck, startWith, switchMap } from "rxjs/operators";
import { Resource } from "src/app/models/resource.model";
import { environment } from "src/environments/environment";
import {
  createLoadingState,
  LoadingState,
  switchMapWithLoading,
} from "../../interfaces/loading-state";

@Injectable()
export class ResourcesService {
  constructor(protected http: HttpClient) {}

  partnerResourcesPath = environment.ws + "/partner-resources";

  getAllResources(): Observable<Resource[]> {
    return this.http
      .get(this.partnerResourcesPath, {
        responseType: "json",
        headers: {
          version: "2",
        },
      })
      .pipe(
        pluck("data"),
        map((resources: Resource[]) => {
          return resources.map((resource) =>
            new Resource().deserialize(resource)
          );
        })
      );
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
  getResources(resource_ids: string[]): Observable<Resource[]>;
  getResources(
    resource_ids: string[],
    loadingState: true
  ): Observable<LoadingState<Resource[]>>;
  getResources(
    resource_ids: string[],
    loadingState = false
  ): Observable<Resource[]> | Observable<LoadingState<Resource[]>> {
    const fetchResources = (ids: any) => {
      return combineLatest([
        ...ids.map((id) => this.get_resource(id)),
      ]) as Observable<Resource[]>;
    };
    const resources$ = of(resource_ids).pipe<
      LoadingState<Resource[]> | Resource[]
    >(
      loadingState
        ? switchMapWithLoading(fetchResources)
        : switchMap(fetchResources)
    );
    if (loadingState) {
      return resources$ as Observable<LoadingState<Resource[]>>;
    }
    return resources$ as Observable<Resource[]>;
  }

  updateResource(resource: Resource, logo?: File) {
    const formData = new FormData();

    for (const key of Object.keys(resource.serialize())) {
      const value = resource[key];
      formData.set(key, value);
    }
    if (logo) {
      formData.set("logo", logo);
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
