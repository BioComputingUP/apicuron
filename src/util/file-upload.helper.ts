export class FileUploadDto {
	buffer: Buffer;
	filename: string;
	mimetype: string;

	static fromMulter(file: Express.Multer.File) {
		const logoFile = new FileUploadDto();
		logoFile.buffer = file.buffer;
		logoFile.filename = file.originalname;
		logoFile.mimetype = file.mimetype;
		return logoFile;
	}
}
