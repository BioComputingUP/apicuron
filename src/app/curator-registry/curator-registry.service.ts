import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Paginated } from "../interfaces/paginated";
import { RegistryEntry } from "../models/registryEntry.model";
import { Observable } from "rxjs";
@Injectable()
export class CuratorRegistryService {
  private wsUrl = environment.ws;

  constructor(private httpClient: HttpClient) {}

  getAllCurators(params: HttpParams): Observable<Paginated<RegistryEntry>> {
    const result$ = this.httpClient.get(this.wsUrl + "/registry", {
      params,
      headers: {
        version: "2",
      },
    });
    return result$ as Observable<Paginated<RegistryEntry>>;
  }
}
