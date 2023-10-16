import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UpdateUser } from "src/app/models/User.model";
import { environment } from "src/environments/environment";

@Injectable()
export class UsersService {
  constructor(protected http: HttpClient) {}

  ws = environment.ws;
  updateUser(updateUser: UpdateUser) {
    return this.http.patch(this.ws + "/users", updateUser.serialize(), {
      headers: {
        version: "2",
      },
    });
  }
}
