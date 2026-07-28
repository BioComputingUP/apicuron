import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubOrcidResolver {
	private readonly testMap: Record<string, string> = {
		'Mehdi-SK': '0009-0009-3602-3558',
		adelbke: '0000-0001-9531-6339',
		XimeAixa: '0000-0002-9211-1255',
		geekn0rd: '0009-0007-1740-8781',
	};

	async resolve(githubLogin: string | null): Promise<string | null> {
		if (githubLogin === null) return null;
		return this.testMap[githubLogin] ?? null;
	}
}
