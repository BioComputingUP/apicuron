import { Deserializable } from "./deserializable";
import { Resource } from "./resource.model";
import { User } from "./User.model";

export class RegistryEntry implements Deserializable{
	deserialize(input: any): this {
		this.curator_orcid = input.curator_orcid;
		this.curator = input.curator ? new User().deserialize(input.curator) : null;
		this.contributed_to = input.contributed_to;
		return this;
	}

  curator_orcid: string;
  curator: User;
  contributed_to: {
    resource_id: string;
    resource: Resource;
    groups: any[];
  }[];

  generate_avatar(){
    return this.curator.generate_avatar()
  }
}
