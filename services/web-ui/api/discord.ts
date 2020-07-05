import * as Mongo from '@stagg/mongo'
import { Client } from 'discord.js'
import { SendConfirmation } from './mail'
import cfg from '../config/api'

Mongo.Config(cfg.mongo)
const discord = new Client()
discord.login(cfg.discord.token)

export const profileById = async (id:string) => discord.users.fetch(id)
export const profileByEmail = async (email:string) => {
    const mongo = await Mongo.Client()
    const player = await mongo.collection('players').findOne({ email })
    if (!player) return null
    if (!player.discord) return null
    return profileById(player.discord)
}

export const profile = async (req, res) => {
    const discord = req.query.id ? await profileById(req.query.id) : await profileByEmail(req.query.email)
    res.send({ ...discord })
}

export const register = async (req, res) => {
    const { email, discord } = req.body
    if (!discord || !discord.length) return res.status(400).send({ error: 'invalid Discord ID' })
    if (!email.match(/^.+@.+\..+$/i)) return res.status(400).send({ error: 'invalid email' })
    const send = await SendConfirmation(email, { discord })
    send ? res.send({ success: true }) : res.status(500).send({ success: false, error: 'Email API Failure' })
}