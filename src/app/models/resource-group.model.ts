import { Deserializable } from "./deserializable";


export class ResourceGroup implements Deserializable {
	name: string;
	displayedName: string;
	resource_id: string;
	defaultMembers: string[];

	
	deserialize(input: this): this {
		this.name = input.name;
		this.displayedName = input.displayedName;
		this.resource_id = input.resource_id;
		this.defaultMembers = input.defaultMembers;

		return this;
	}

}