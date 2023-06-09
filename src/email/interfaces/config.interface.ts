import { Transporter } from "nodemailer";


export type TransportOptions = {
    pool: Boolean,
    host: string,
    port: number,
    secure: Boolean, // use TLS
    auth: {
        user: string,
        pass: string,
    },
}


export type TransportOptionsNames = {
    [key: string]: TransportOptions;
  };


export type EmailModuleForRootConfig = {
    transportOptions: TransportOptionsNames,
    accounts: any
}

export type Transporters = {
    [key: string]: Transporter;

}