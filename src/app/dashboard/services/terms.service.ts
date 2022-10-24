import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

export type UpdateTerm = {
  activity_term: string;
  resource_id: string;
  activity_category?: string;
  score?: string;
  description?: string;
};

export type CreateTerm = Required<UpdateTerm>

@Injectable()
export class TermsService {
  constructor(private http: HttpClient) {}

  update_term(term: UpdateTerm) {
    return this.http.put(environment.ws + "/terms/edit", term, {
      headers: {
        version: "2",
      },
    });
  }

  create_term(term: CreateTerm) {
    return this.http.post(environment.ws + '/terms', term, {
      headers: {
        version: '2'
      }
    })
  }
}
