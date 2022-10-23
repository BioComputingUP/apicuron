import { PipeTransform, Injectable, ArgumentMetadata, ImATeapotException } from '@nestjs/common';
import * as DOMPurify from 'isomorphic-dompurify';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import * as mime from 'mime-types'
@Injectable()
export class SvgSanitationValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if(file && mime.extension(file.mimetype) == 'svg'){

      const fileContent = file.buffer ? file.buffer.toString() : readFileSync(file.path).toString()

      const clean = DOMPurify.sanitize(fileContent)
      if(clean == ''){
          throw new ImATeapotException()
      }else{
          // writeFileSync(resolve(file.path), clean)
          return file
      }
    }else{
      return file
    }
    
    
  }
}
