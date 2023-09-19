import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SubmitReportDto } from '../reports/dto/submit-report.dto';
import { useContainer, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

async function bootstrap(){

    const app = await NestFactory.createApplicationContext(AppModule)

    // class-validator setup
	useContainer(app.select(AppModule), { fallbackOnErrors: true });

    const plain = {"activity_term":"update_family","curator_orcid":"0000-0001-8457-4455","entity_uri":"https://rfam.org/family/RF01763","timestamp":"2022-01-14 15:35:31","resource_id":"rfam"}

    const dtoInstance = plainToClass(SubmitReportDto, plain)

    const r = await validate(dtoInstance)

    console.log({result: r})



    await app.close();

}



bootstrap();