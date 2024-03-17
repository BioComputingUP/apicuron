import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { v4 as uuid } from 'uuid';
import { kebabCase } from 'lodash';
import { createAvatar } from '@dicebear/core';
import { identicon } from '@dicebear/collection';

export async function generateAvatar(
	username: string,
	publicFolderPath: string,
	publicUrlPath: string,
): Promise<string> {
	const avatar = createAvatar(identicon, {
		seed: username,
		scale: 80,
		radius: 50,
	});

	const filename = `${kebabCase(username)}-${uuid().split('-').shift()}.svg`;

	const avatarFilepath = join(publicFolderPath, 'users', filename);

	await mkdir(dirname(avatarFilepath), { recursive: true });

	await avatar.toFile(avatarFilepath);

	return avatarFilepath
		.replace(publicFolderPath, publicUrlPath)
		.replace(/^\/+/, '');
}
