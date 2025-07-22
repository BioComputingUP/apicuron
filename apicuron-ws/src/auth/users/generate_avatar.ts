import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { v4 as uuid } from 'uuid';
import { kebabCase } from 'lodash';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

export async function generateAvatar(
	username: string,
	// publicFolderPath: string,
	// publicUrlPath: string,
): Promise<string> {
	const { createAvatar } = await import('@dicebear/core');
	const { identicon } = await import('@dicebear/collection');
	const avatar = createAvatar(identicon, {
		seed: username,
		scale: 80,
		radius: 50,
	});

	return avatar.toString();

	// const filename = `${uuid()}.svg`;

	// const avatarFilepath = join(publicFolderPath, 'users', filename);

	// await mkdir(dirname(avatarFilepath), { recursive: true });

	// if (existsSync(avatarFilepath)) {
	// 	await unlink(avatarFilepath);
	// }

	// await avatar.toFile(avatarFilepath);

	// return avatarFilepath
	// 	.replace(publicFolderPath, publicUrlPath)
	// 	.replace(/^\/+/, '');
}
