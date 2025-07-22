import { HttpService } from "@nestjs/axios";
import { readFileSync } from "fs";
import * as mime from "mime";
import { basename } from "path";

export class FileUploadDto {
	buffer: Buffer;
	filename: string;
	mimetype: string;

	static fromMulter(file: Express.Multer.File) {
		const fileRef = new FileUploadDto();
		fileRef.buffer = file.buffer;
		fileRef.filename = file.originalname;
		fileRef.mimetype = file.mimetype;
		return fileRef;
	}

	static fromPath(path: string) {
		const fileRef = new FileUploadDto();
		fileRef.buffer = readFileSync(path);
		fileRef.filename = basename(path);
		fileRef.mimetype = mime.lookup(path);
		return fileRef;
	}

	static async fromPicsum(url: string, http: HttpService) {
		const fileRef = new FileUploadDto();
		const response = await http.axiosRef.get(url, { responseType: 'arraybuffer' });
		fileRef.buffer =  Buffer.from(response.data as string);
		fileRef.mimetype = response.headers['content-type']
		fileRef.filename = response.headers['picsum-id'] + '.' +mime.extension(fileRef.mimetype);
		return fileRef;
	}
}
