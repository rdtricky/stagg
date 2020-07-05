import * as jwt from 'jsonwebtoken'
import * as gmailSend from 'gmail-send'
import { confirm } from '../emails'
import cfg from '../config/api'

export const Send = (to:string, subject:string, html:string) => new Promise((resolve,reject) => {
    gmailSend({
        to,
        subject,
        user: cfg.gmail.user,
        pass: cfg.gmail.pass,
    })({ html }, (error, result, fullResult) => error ? reject(error) : resolve({ result, fullResult }))
    console.log(`[>] Mail: sent "${subject}" to ${to}`)
})
export const SendConfirmation = async (email:string, extendedPayload:{[key:string]:any}={}):Promise<boolean> => {
    const token = jwt.sign({ email, ...extendedPayload }, cfg.jwt)
    const emailHTML = confirm.split('{jwtToken}').join(token)
    try {
        await Send(email, 'Confirm your email address for Stagg.co', emailHTML)
        return true
    } catch(e) {
        console.log('Email confirmation failed', e)
        return false
    }
}