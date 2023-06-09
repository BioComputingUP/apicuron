import { Injectable, Inject } from '@nestjs/common'
import Mail from 'nodemailer/lib/mailer';
import { Transporters } from './interfaces/config.interface';
@Injectable()
export class EmailService {

    constructor(@Inject('TRANSPORTERS') protected transporters: Transporters) {}


    public async sendEmail(transportName: string, email: Mail.Options){
        return await this.transporters[transportName].sendMail(email)
    }
}