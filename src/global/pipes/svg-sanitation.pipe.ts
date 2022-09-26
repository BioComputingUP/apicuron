import { PipeTransform, Injectable, ArgumentMetadata, ImATeapotException } from '@nestjs/common';
import * as DOMPurify from 'isomorphic-dompurify';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
@Injectable()
export class SvgSanitationValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    const clean = DOMPurify.sanitize(readFileSync(resolve(file.path)).toString())
    if(clean == ''){
        throw new ImATeapotException()
    }else{
        writeFileSync(resolve(file.path), clean)
        return file
    }
    
  }
}
