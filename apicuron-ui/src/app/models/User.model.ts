import { Deserializable } from "src/app/interfaces/deserializable.model";
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
        return this;
    }

    displayedName: string;
    full_name?: string;
    last_update?: string;
	resources?: Array<{ resource_id: string, name: string}>;
    _id?: string;
    orcid_id: string;
    role: "user" | 'admin';
    family_name?: string;
    given_name?: string;
    avatar?: string;



    generate_avatar(scale= 80, radius= 50): URL {
        if(this.avatar) {
            return new URL(this.avatar, environment.ws + '/');
        }
        const hash = encodeURIComponent(this.displayedName);
        const defaultImage = encodeURIComponent(`https://api.dicebear.com/5.x/identicon/png/seed=${hash}&scale=${scale}&radius=${radius}`);
        return new URL(`https://www.gravatar.com/avatar/${hash}?d=${defaultImage}`);
    }

    orcid_url(): URL{
        return new URL(this.orcid_id, environment.orcid_main_url)
    }
}