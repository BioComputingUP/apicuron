import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { map, Observable } from "rxjs";
import { Term } from "../../models/term.model";

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

  get_resource_terms(resource_id: string): Observable<Term[]> {
    return this.http.get(this.ws + '/terms', {
      headers: {
        version: '2'
      },
      params: {
        resource_id
      }
    }).pipe(
      map((response: { data: any[]}) => response.data.map((term) => new Term().deserialize(term)))
    )
  }

  update_term(term: Term) {
    return this.http.put(this.ws + "/terms/edit", term.serialize(), {
      headers: {
        version: "2",
      },
    });
  }

  create_term(term: Term) {
    return this.http.post(this.ws + '/terms', term.serialize(), {
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
