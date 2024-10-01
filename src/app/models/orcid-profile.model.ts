import { environment } from "../../environments/environment";
import { Deserializable } from "./deserializable";

export class OrcidProfile implements Deserializable {
  orcid_id: string;
  given_names: string;
  family_name: string;
  credit_name?: string;
  displayedName: string;
  institution_name?: string[];
  profileUrl: string;

  
  deserialize(input: any): this {
    if (!input["orcid-id"] || typeof input["orcid-id"] != "string") {
      throw new Error(
        `Invalid 'orcid-id when trying to instantiate OrcidProfile from ${input}`
      );
    }
    if (input["institution-name"] && Array.isArray(input["institution-name"])) {
      this.institution_name = input["institution-name"];
    }

    this.orcid_id = input["orcid-id"];
    this.given_names = input["given-names"] ?? "";
    this.family_name = input["family-names"] ?? "";
    this.credit_name = input["credit-name"] ?? null;

    this.displayedName =
      this.credit_name ?? `${this.given_names} ${this.family_name}`;

    this.profileUrl = `${environment.orcid_main_url}${this.orcid_id}`;

    return this;
  }
}
