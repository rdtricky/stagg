import * as API from '@stagg/api'
export namespace T {
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
            export interface Callback { (res:API.T.CallOfDuty.Res.Warzone.Matches):void }
        }
    }
}
