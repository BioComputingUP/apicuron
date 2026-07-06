import { Controller, Get, Param, Res } from '@nestjs/common';
import * as mime from 'mime';
import { StorageType } from './storage.config';
import { StorageService } from '@biocomputingup/nest-storage-manager';
import { Response } from 'express';

@Controller('storage')
export class ServeFilesController {
	constructor(protected storageService: StorageService) {}

	private async serveFile(
		path: string,
		res: Response,
		storageType: StorageType,
	) {
		try {
			const fileStream = await this.storageService.getStream(storageType, path);
			const mimeType = mime.lookup(path);

			res.setHeader('Content-Type', mimeType || 'application/octet-stream');
			res.setHeader('Content-Disposition', `inline; filename=${path}`);
			// res.setHeader('Content-Length', fileBuffer.length);
			res.setHeader('Transfer-Encoding', 'chunked');
			fileStream.pipe(res);
		} catch (err) {
			res.status(404).send(`File not found: ${path}`);
		}
	}

	@Get('public/:path(*)')
	async publicEngineServe(@Param('path') path: string, @Res() res: Response) {
		this.serveFile(path, res, StorageType.public);
	}
	@Get('private/:path(*)')
	async privateEngineServe(@Param('path') path: string, @Res() res: Response) {
		this.serveFile(path, res, StorageType.private);
	}
}
