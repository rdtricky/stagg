import JSONStream from 'JSONStream'
import * as Mongo from '@stagg/mongo'
import cfg from '../config/api'

Mongo.Config(cfg.mongo)
export const meta = async (req, res) => {
    const mongo = await Mongo.Client()
    const players = await mongo.collection('players').countDocuments()
    const matches = await mongo.collection('matches.wz').countDocuments()
    const performances = await mongo.collection('performances.wz').countDocuments()
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.send({ players, matches, performances })
}

export const download = async (req,res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    const mongo = await Mongo.Client()
    mongo.collection('performances.wz').find({ 'stats.teamPlacement': { $lt: 11 } }).pipe(JSONStream.stringify()).pipe(res)
}
