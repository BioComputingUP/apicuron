import { Deserializable } from "src/app/interfaces/deserializable.model";
import { environment } from "src/environments/environment";

export class Resource implements Deserializable {
  deserialize(input: any): this {
    this.resource_description = input.resource_description;
    this.resource_id = input.resource_id;
    this.resource_long_name = input.resource_long_name;
    this.resource_name = input.resource_name;
    this.resource_uri = new URL(input.resource_uri);
    this.resource_url = new URL(input.resource_url);
    this.state = input.state;
    this.color = input.color;

    if (input.logo.startsWith("assets")) {
      this.logo = new URL(input.logo, environment.ws + "/");
    } else {
      this.logo = new URL(
        input.logo
          .split("/")
          .filter((el) => el)
          .join("/"),
        environment.ws + "/"
      );
    }
    this.logo = input.logo;

    this.color = input.color;
    return this;
  }

  resource_description: string;
  resource_id: string;
  resource_long_name: string;
  resource_name: string;
  resource_uri: URL;
  resource_url: URL;
  state: string;
  logo: URL;
  color: string;
}
