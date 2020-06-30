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