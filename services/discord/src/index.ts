import * as cors from 'cors'
import * as express from 'express'
import DiscordBot from '@stagg/discord'
import { Mail } from '@stagg/api'
import cfg from './config'

Mail.Config(cfg.gmail)
Mail.Send('dan@mdlindsey.com', 'Stagg Bot Test', 'beep boop')
new DiscordBot(cfg.discord.token, cfg.mongo)
const app = express()
app.use(cors({ credentials: false })).listen(cfg.port, async () => {
    app.get('/', (req,res) => res.redirect('https://discord.me/ggez'))
    app.get('/health', (req,res) => res.status(200).send('ok'))
    console.log(
        `${'\x1b[32m' /* green */}${'\x1b[1m' /* bright/bold */}`+
        `----------------------------------------------------------\n`+
        `| Stagg Discord Service\n`+
        `| http://localhost:${cfg.port}\n`+
        `----------------------------------------------------------${'\x1b[0m' /* reset */}`
    )
})
