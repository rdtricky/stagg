import * as cors from 'cors'
import SocketIO from 'socket.io'
import * as express from 'express'
import * as Mongo from '@stagg/mongo'
import cfg from './config'

Mongo.Config(cfg.mongo)
const app = express()
const server = app.use(cors({ credentials: false })).listen(cfg.port, async () => {
    app.get('/', (req,res) => res.status(418).send({ teapot: true }))
    app.get('/health', (req,res) => res.status(200).send('ok'))
    console.log(
        `${'\x1b[32m' /* green */}${'\x1b[1m' /* bright/bold */}`+
        `----------------------------------------------------------\n`+
        `| Stagg IO Service\n`+
        `| http://localhost:${cfg.port}\n`+
        `----------------------------------------------------------${'\x1b[0m' /* reset */}`
    )
})
const io = SocketIO.listen(server)
io.on('connection', (client:SocketIO.Server) => {
    console.log(`[>] New socket.io client`)
    client.on('download.profile', async ({ platform, username }, matchIds:string[]) => {
        const mode = 'wz'
        let connected = true
        client.on('disconnect', () => connected = false)
        client.on('download.profile.abandoned', () => connected = false)
        console.log(`[>] Request to download ${matchIds.length} matches for ${platform}<${username}>`)
        const player = await Mongo.CallOfDuty.Get.Player(username, platform)
        if (!player) {
            return client.emit('download.profile.error', 404, { mode, platform, username })
        }
        const mongo = await Mongo.Client()
        const performances = await mongo.collection('performances.wz').find({ "player._id": player._id, matchId: { $in: matchIds }}).toArray()
        for(const p of performances) {
            if (!connected) break
            console.log('    Emitting performance', p.matchId)
            client.emit('download.profile.performance', { mode, platform, username }, p)
            mongo.collection('matches.wz').find({ matchId: p.matchId }).forEach(m => {
                console.log('    Emitting match', m.matchId)
                client.emit('download.profile.match', m)
            })
            await delay(cfg.io.delay)
        }
    })
})
const delay = (ms:number) => new Promise(resolve => setTimeout(() => resolve(), ms))
