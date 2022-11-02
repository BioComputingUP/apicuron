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

export type DeleteTerm = Omit<UpdateTerm, 'activity_category' | 'score' | 'description'>

@Injectable()
export class TermsService {
  constructor(private http: HttpClient) {}

  ws = environment.ws

  get_resource_terms(resource_id: string){
    return this.http.get(this.ws + '/terms', {
      headers: {
        version: '2'
      },
      params: {
        resource_id
      }
    })
  }

  update_term(term: UpdateTerm) {
    return this.http.put(this.ws + "/terms/edit", term, {
      headers: {
        version: "2",
      },
    });
  }

  create_term(term: CreateTerm) {
    return this.http.post(this.ws + '/terms', term, {
      headers: {
        version: '2'
      }
    })
  }

  delete_term({ activity_term, resource_id }: DeleteTerm){
    return this.http.delete(`${this.ws}/terms/${activity_term}/partner-resource/${resource_id}`, {
      headers: {
        version: '2'
      }
    })
  }
}
