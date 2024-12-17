import {
  Deserializable,
  Serializable,
} from "src/app/interfaces/deserializable.model";
import { environment } from "src/environments/environment";

export class User implements Deserializable {
  deserialize(input: any): this {
    this.displayedName = input.displayedName;
    this.role = input.role;
    this.orcid_id = input.orcid_id;
    // optional fields
    this.full_name = input.full_name ?? null;
    this.last_update = input.last_update ?? null;
    this._id = input._id ?? null;
    this.resources = input.resources ?? null;
    this.family_name = input.family_name ?? null;
    this.given_name = input.given_name ?? null;
    this.avatar = input.avatar ?? null;
    this.privacy = input.privacy ?? "public";
    this.biography = input.biography ?? "Empty";
    this.affiliation = input.affiliation ?? "Nothing";
    this.keywords = input.keywords ?? null;
    this.links = input.links ?? null;
    this.newLogin = input.isNewLogin ?? false;
    return this;
  }

  displayedName: string;
  full_name?: string;
  last_update?: string;
  resources?: Array<{ resource_id: string; name: string }>;
  _id?: string;
  orcid_id: string;
  role: "user" | "admin";
  family_name?: string;
  given_name?: string;
  avatar?: string;
  privacy: "private" | "public";

  biography?: string;
  affiliation?: string
  keywords?: [string];
  links?: Array<{name: string; url: URL }>
  newLogin?: boolean;

  generate_avatar(scale = 80, radius = 50): URL {
    if (this.avatar) {
      return new URL(this.avatar, environment.ws + "/");
    }
    const hash = encodeURIComponent(this.displayedName);
    const defaultImage = encodeURIComponent(
      `https://api.dicebear.com/5.x/identicon/png/seed=${hash}&scale=${scale}&radius=${radius}`
    );
    return new URL(`https://www.gravatar.com/avatar/${hash}?d=${defaultImage}`);
  }

  orcid_url(): URL {
    return new URL(this.orcid_id, environment.orcid_main_url);
  }

  firstTimeLogin(): boolean {
    return true;
  }
}

  // upload_avatar(scale = 80, radius = 50): URL {

  // }

export class UpdateUser implements Deserializable, Serializable {
  serialize() {
    const payload: any = { orcid_id: this.orcid_id };
    if (this.email) {
      payload.email = this.email;
    }

    if (this.privacy) {
      payload.privacy = this.privacy;
    }
    if (this.isNewLogin){
      payload.isNewLogin = this.isNewLogin;
    }

    return payload;
  }
  deserialize(input: any): this {
    this.email = input.email ?? null;
    this.privacy = input.privacy ?? null;
    this.orcid_id = input.orcid_id;
    this.isNewLogin = input.isNewLogin ?? true;
    return this;
  }
  email?: string;
  privacy?: "public" | "private";
  orcid_id: string;
  isNewLogin?: boolean
}
