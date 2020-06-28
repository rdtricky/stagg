import * as cors from 'cors'
import * as express from 'express'
import * as Mongo from '@stagg/mongo'
import { delay } from '@stagg/util'
import { update, recheck, initialize } from './scrapers'
import cfg from './config'
const app = express()
app.use(cors({ credentials: false })).listen(cfg.port, async () => {
    app.get('/', (req,res) => res.status(418).send({ teapot: true }))
    app.get('/health', (req,res) => res.status(200).send('ok'))
    console.log(
        `${'\x1b[32m' /* green */}${'\x1b[1m' /* bright/bold */}`+
        `----------------------------------------------------------\n`+
        `| Stagg Scraper Service\n`+
        `| http://localhost:${cfg.port}\n`+
        `----------------------------------------------------------${'\x1b[0m' /* reset */}`
    )
    Mongo.Config(cfg.mongo)
    initializeNewPlayers()
    updateExistingPlayers()
    recheckExistingPlayers()
})

const updateExistingPlayers = async () => {
    const db = await Mongo.Client()
    while(true) {
        const [ player ] = await this.db.collection('players').find().sort({ 'scrape.updated': 1 }).toArray()
        if (!player) continue
        await update(player)
        await delay(1000)
    }
}
const initializeNewPlayers = async () => {
    const db = await Mongo.Client()
    while(true) {
        const player = await db.collection('players').findOne({ profiles: { $exists: false } })
        if (!player) continue
        await initialize(player)
        await delay(1000)
    }
}
const recheckExistingPlayers = async () => {
    const db = await Mongo.Client()
    while(true) {
        const [ player ] = await this.db.collection('players').find().sort({ 'scrape.updated': 1 }).toArray()
        if (!player) continue
        await recheck(player)
        await delay(1000)
    }
}
