import * as API from '@stagg/api'
import { T } from './index.d'
const delay = (ms:number) => new Promise(resolve => setTimeout(() => resolve(), ms))
export class CallOfDuty {
    private failures:number
    private complete:boolean
    private timestamp:number
    private matchIds:string[]
    private readonly username : string
    private readonly platform : API.T.CallOfDuty.Platform
    private readonly game     : API.T.CallOfDuty.Game
    private readonly mode     : API.T.CallOfDuty.Mode
    private readonly API      : API.CallOfDuty
    private readonly callback : Function
    private readonly options  : T.CallOfDuty.Options = {
        limit: 0,
        retry: 3,
        delay: 500,
        refetch: true,
        timestamp: 0,
        perpetual: true,
        logger: console.log,
        timestampOffset: 300,
    }
    constructor(username:string, platform:API.T.CallOfDuty.Platform, tokens:API.T.CallOfDuty.Tokens, callback:Function, options?:Partial<T.CallOfDuty.Options>) {
        this.username = username
        this.platform = platform
        this.callback = callback
        this.API = new API.CallOfDuty(tokens)
        this.options = {...this.options, ...options}
        this.Run()
    }
    async Run() {
        this.Reset()
        if (!this.options.perpetual) return await this.Fetch()
        while(!this.complete && this.failures < this.options.retry) {
            await this.Fetch()
            await delay(this.options.delay)
        }
        this.options.logger(`[${this.complete ? '+' : '!'}] Scraping ${this.complete ? 'complete' : 'failed'} for ${this.platform}/${this.username}`)
        await this.Run()
    }
    Reset() {
        this.failures = 0
        this.matchIds = []
        this.complete = false
        this.timestamp = this.options.timestamp
    }
    NextTimestamp(matches:API.T.CallOfDuty.Res.Warzone.Match[]):number {
        const timestamps = matches.map(m => m.utcEndSeconds)
        const edgeTimestamp = Math.min(...timestamps)
        const offsetTimestamp = edgeTimestamp - this.options.timestampOffset
        return offsetTimestamp * 1000 // convert seconds to microseconds
    }
    async Fetch() {
        this.options.logger(`[>] Scraping ${this.platform}/${this.username} @ ${this.timestamp}`)
        try {
            const res = await this.API.Matches(this.username, this.platform, this.mode, this.game, this.timestamp)
            this.callback(res)
            this.timestamp = this.NextTimestamp(res.matches)
            const newMatchIds = res.matches.filter(m => m).map(m => m.matchID)
            this.matchIds = [...this.matchIds, ...newMatchIds]
            const lessThan20 = newMatchIds.length < 20
            const passedLimit = this.options.limit && this.matchIds.length >= this.options.limit
            this.complete = lessThan20 || passedLimit
            this.failures = 0
        } catch(e) {
            if (this.failures < this.options.retry) {
                this.failures++
                await this.Fetch()
            }
        }
    }
}
