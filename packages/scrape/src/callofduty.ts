import { T as ApiTypes, CallOfDuty as CallOfDutyAPI } from '@stagg/api'
export class CallOfDuty {
    private complete:boolean
    private timestamp:number
    private readonly username:string
    private readonly platform:string
    private readonly callback:Function
    private readonly tokens:CallOfDutyAPI.T.Tokens
    private readonly options:CallOfDuty.Options = {
        delay: 100,
        limit: 0,
        refetch: true,
        timestamp: 0,
        perpetual: true,
        logger: console.log,
        direction: CallOfDuty.Options.Direction.Desc
    }
    constructor(username:string, platform:string, callback:Function, options?:Partial<CallOfDuty.Options>) {
        this.complete = false
        this.username = username
        this.platform = platform
        this.callback = callback
        this.options = {...this.options, ...options}
        this.timestamp = this.options.timestamp
    }
    async Fetch() {
        this.options.logger(`[>] Scrape CallOfDutyAPI for ${this.platform}/${this.username}`)
        const foo = await CallOfDutyAPI
    }
}
export namespace CallOfDuty {
    export interface Options {
        delay:number
        limit:number
        refetch:boolean
        timestamp:number
        perpetual:boolean
        logger:Function
        direction: CallOfDuty.Options.Direction
    }
    export namespace Options {
        export enum Direction {
            Asc,
            Desc
        }
    }
}
