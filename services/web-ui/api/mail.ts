import * as jwt from 'jsonwebtoken'
import * as gmailSend from 'gmail-send'
import * as Mongo from '@stagg/mongo'
import * as emails from '../emails'
import cfg from '../config/api'

Mongo.Config(cfg.mongo)

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
    const emailHTML = emails.confirm.split('{jwtToken}').join(token)
    try {
        await Send(email, 'Confirm your email address for Stagg.co', emailHTML)
        return true
    } catch(e) {
        console.log('Email confirmation failed', e)
        return false
    }
}

export const confirm = async (req,res) => {
    const mongo = await Mongo.Client()
    if (!req.query.jwt) return res.status(400).send({ error: 'jwt required' })
    try {
        const decoded = jwt.verify(req.query.jwt, cfg.jwt) as any
        if (!decoded || !decoded.email || !decoded.discord) throw 'invalid jwt'
        const player = await mongo.collection('players').findOne({ email: decoded.email })
        if (!player) throw 'player not found'
        await mongo.collection('players').updateOne({ _id: player._id }, { $set: { discord: decoded.discord } })
        res.send({ success: true })
    } catch(e) {
        res.status(400).send({ success: false, error: 'invalid jwt' })
    }
}
