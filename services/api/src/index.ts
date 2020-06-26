import * as cors from 'cors'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import { Config as SetMongoConfig } from '@stagg/mongo'
import * as HTTP from './http'
import cfg from './config'

const app = express()
SetMongoConfig(cfg.mongo)
app.use(cors({ credentials: false })).use(bodyParser.json()).listen(cfg.port, async () => {
    app.get('/', (req,res) => res.status(418).send({ teapot: true }))
    app.get('/health', (req,res) => res.status(200).send('ok'))
    app.get('/m/:matchId', HTTP.Match)
    app.get('/u/search/:username', HTTP.Profile.Search)
    app.get('/u/:platform/:username/ping', HTTP.Profile.Ping)
    app.post('/u/:platform/:username/wz', HTTP.Profile.Warzone.Diff)
    app.post('/u/login', HTTP.Login)
    console.log(
        `${'\x1b[32m' /* green */}${'\x1b[1m' /* bright/bold */}`+
        `----------------------------------------------------------\n`+
        `| Stagg API Service\n`+
        `| http://localhost:${cfg.port}\n`+
        `----------------------------------------------------------${'\x1b[0m' /* reset */}`
    )
})
