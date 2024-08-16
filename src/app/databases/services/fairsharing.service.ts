import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable()
export class FairSharingService {
  constructor(private http: HttpClient) {}

  private fairsharing_url = environment.fairsharing_url;
  private base_headers = {
    Accept: "application/json",
  };
}