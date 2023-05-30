
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication, docs_prefix= '') {
    // setup for swagger docs generation
    const swaggerConfig = new DocumentBuilder()
        // .setTitle('APICURON V2')
        .setTitle('APICURON API Documentation')
        .setDescription('The APICURON API Documentation')
        .addSecurity('basic',{
            type: 'apiKey',
            in: 'header',
            name: 'authorization',
            description: 'Specify the token value with the `idtoken` prefix, e.g. "idtoken MYTOKEN"',
        })
        .setVersion('2.0')
        .addTag('Resources')
        .addTag('Partner Resources')
        .addTag('Users')
        .addTag('Curation Terms')
        .addTag('Achievements Definition')
        .setBasePath('/api/')
        .build()

    // setting the global prefix for the api docs generation
    app.setGlobalPrefix(docs_prefix)

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
        ignoreGlobalPrefix: false
    })

    SwaggerModule.setup('/', app, document, {
        useGlobalPrefix: false,
        customCss:'.topbar-wrapper img { content: url(/assets/APICURON.svg;}'
    })


    // resetting the prefix for the proxy routing 
    app.setGlobalPrefix('')

    return
}

