import * as nodemailer from 'nodemailer'
import * as CallOfDuty from './callofduty'
export { CallOfDuty }

export namespace Mail {
    let address, transporter
    export const Config = ({ user, pass }) => {
        address = user
        transporter = nodemailer.createTransport({ 
            service: 'gmail', 
            auth: { 
                user,
                pass,
            } 
        })
    }
    export const Send = (to:string, subject:string, text:string) => new Promise((resolve,reject) => {
        if (!transporter) throw new Error('Email transporter not initialized')
        transporter.sendMail({
            to,
            subject,
            text,
            from: address,
        }, (err,data) => err ? reject(err) : resolve(data))
    })
}