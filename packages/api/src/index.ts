import * as jwt from 'jsonwebtoken'
import * as gmailSend from 'gmail-send'
import { T as MongoT } from '@stagg/mongo'
import * as CallOfDuty from './callofduty'
import { confirm } from './emails'
export { CallOfDuty }

export namespace JWT {
    export let secret
    export const Config = (jwtSecret:string) => secret = jwtSecret
}

export namespace Mongo {
    export let cfg
    export const Config = (config:MongoT.Config) => cfg = config
}

export namespace Mail {
    let address, password
    export const Config = ({ user, pass }) => {
        address = user
        password = pass
    }
    export const Send = (to:string, subject:string, html:string) => new Promise((resolve,reject) => {
        if (!address || !password) throw new Error('Email config not initialized')
        gmailSend({
            to,
            subject,
            user: address,
            pass: password,
        })({ html }, (error, result, fullResult) => error ? reject(error) : resolve({ result, fullResult }))
    })
    export const SendConfirmation = async (email:string, extendedPayload:{[key:string]:any}={}) => {
        if (!JWT.secret) throw new Error('Email confirmation JWT secret not initialized')
        const token = jwt.sign({ email, ...extendedPayload }, JWT.secret)
        const emailHTML = confirm.split('{jwtToken}').join(token)
        try { await Send(email, 'Confirm your email address for Stagg.co', emailHTML) }
        catch(e) { console.log('Email confirmation failed', e) }
    }
}

export namespace User {
    export const ConfirmEmail = async (token:string) => {
        if (!JWT.secret) throw new Error('Confirm email JWT secret not initialized')
        try {
            const { email, discord } = jwt.verify(token, JWT.secret)
        } catch(e) {
            return false
        }
    }
}

