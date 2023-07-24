import {
    MaxFileSizeValidator,
	FileTypeValidator,
    ParseFilePipe
} from '@nestjs/common'

export function ResourceLogoValidationPipe(required = false) {
    return new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 1000000 }),
            new FileTypeValidator({
                fileType: /(^image)(\/)(jpeg|png|svg\+xml|webp)*/gm,
            }),
        ],
        fileIsRequired: required,
    });
    
}