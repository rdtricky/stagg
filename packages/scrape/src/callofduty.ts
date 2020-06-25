import { T as API, CallOfDuty as CallOfDutyAPI } from '@stagg/api'
export class CallOfDuty {
    private failures:number
    private complete:boolean
    private timestamp:number
    private matchIds:string[]
    private readonly username : string
    private readonly platform : API.CallOfDuty.Platform
    private readonly game     : API.CallOfDuty.Game
    private readonly mode     : API.CallOfDuty.Mode
    private readonly API      : CallOfDutyAPI
    private readonly callback : Function
    private readonly options  : CallOfDuty.Options = {
        limit: 0,
        retry: 3,
        delay: 100,
        refetch: true,
        timestamp: 0,
        perpetual: true,
        logger: console.log,
        timestampOffset: 300,
    }
    constructor(username:string, platform:API.CallOfDuty.Platform, tokens:API.CallOfDuty.Tokens, callback:Function, options?:Partial<CallOfDuty.Options>) {
        this.matchIds = []
        this.complete = false
        this.username = username
        this.platform = platform
        this.callback = callback
        this.API = new CallOfDutyAPI(tokens)
        this.options = {...this.options, ...options}
        this.timestamp = this.options.timestamp
    }
    async Run() {
        if (!this.options.perpetual) return await this.Fetch()
        while(!this.complete && this.failures < this.options.retry) {
            await this.Fetch()
        }
    }
    NextTimestamp(matches:API.CallOfDuty.Res.Warzone.Match[]):number {
        const timestamps = matches.map(m => m.utcEndSeconds)
        const edgeTimestamp = Math.min(...timestamps)
        const offsetTimestamp = edgeTimestamp - this.options.timestampOffset
        return offsetTimestamp * 1000 // convert seconds to microseconds
    }
    async Fetch() {
        this.options.logger(`[>] Scrape CallOfDutyAPI for ${this.platform}/${this.username}`)
        try {
            const res = await this.API.Matches(this.username, this.platform, this.mode, this.game, this.timestamp)
            this.callback(res)
            this.timestamp = this.NextTimestamp(res.matches)
            const newMatchIds = res.matches.filter(m => m).map(m => m.matchId)
            this.matchIds = [...this.matchIds, ...newMatchIds]
            const lessThan20 = newMatchIds.length < 20
            const passedLimit = this.matchIds.length >= this.options.limit
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
export namespace CallOfDuty {
    export interface Options {
        limit:number
        retry:number
        delay:number
        refetch:boolean
        timestamp:number
        perpetual:boolean
        logger:Function
        timestampOffset:number
    }
    export namespace Options {
        export interface Callback { (res:API.CallOfDuty.Res.Warzone.Matches):void }
    }
}
