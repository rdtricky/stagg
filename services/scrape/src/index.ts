import * as cors from 'cors'
import * as express from 'express'
import * as Scrape from '@stagg/scrape'
import cfg from './config'

const app = express()
app.use(cors({ credentials: false })).listen(cfg.port, async () => {
    app.get('/', (req,res) => res.status(418).send({ teapot: true }))
    console.log(
        `${'\x1b[32m' /* green */}${'\x1b[1m' /* bright/bold */}`+
        `----------------------------------------------------------\n`+
        `| Stagg Scraper Service\n`+
        `| http://localhost:${cfg.port}\n`+
        `----------------------------------------------------------${'\x1b[0m' /* reset */}`
    )
    new Scrape.CallOfDuty.All({
        ...cfg.api,
        db: {
            config: cfg.mongo,
        }
    })
})
