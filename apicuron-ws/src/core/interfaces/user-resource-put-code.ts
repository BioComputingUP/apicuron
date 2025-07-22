import { Expose } from "class-transformer";

export class UserResourcePutCode {
	@Expose()
	resource_id: string;
	
	@Expose()
	putCode: string;
}
