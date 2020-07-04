import * as Mongo from '@stagg/mongo'
import { Client } from 'discord.js'
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
    const discord = await profileByEmail(req.query.email)
    res.send({ ...discord })
}