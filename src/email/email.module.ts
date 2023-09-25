import { Module, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer'
import { Transporters } from './interfaces/config.interface';
import { EmailService } from './email.service';
@Module({
    
})
export class EmailModule {


    logger = new Logger(EmailModule.name)
    transporters: Transporters = {}

    forRoot({ transportOptions, templates }){

        for(const transportName in transportOptions){
            const options = transportOptions[transportName];


            const transporter = createTransport(options)
            transporter.verify((error, success) => {
                if (error) {
                    this.logger.error(`Could not verify transport: "${transportName}"`)
                    throw new Error(error.message)
                  } else {
                    if(success){
                        this.transporters[transportName] = transporter
                        this.logger.log(`Successfully connected to transport ${transportName}`);
    
                    }
                  }
            })

            transporter.sendMail({})


        }

        return {
            module: EmailModule,
            providers: [
                {
                    provides: 'TRANSPORTERS',
                    useValue: this.transporters
                },
                EmailService
            ],
            exports: [EmailService]
        }
    }
}
