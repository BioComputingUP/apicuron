import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class GitRepository {
	@Prop({
		type: String,
		required: true,
	})
	owner: string;

	@Prop({
		type: String,
		required: true,
	})
	name: string;
	
	get repoUrl(): string {
		return `https://github.com/${this.owner}/${this.name}`;
	}
}
