/** GitHub logins from profile URLs (https://github.com/<login>). Repository and other URLs are ignored. */
export function githubLoginsFromLinks(links: Array<{ url: unknown }>): string[] {
	const logins = new Set<string>();
	for (const link of links) {
		let url: URL;
		try {
			url = new URL(String(link.url));
		} catch {
			continue; // not a valid URL
		}
		if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') continue;

		const segments = url.pathname.split('/').filter(Boolean);
		if (segments.length === 1) logins.add(segments[0]);
	}
	return [...logins];
}