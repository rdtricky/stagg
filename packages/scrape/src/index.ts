import { T as API } from '@stagg/api'
import { CallOfDuty } from './callofduty'
export { CallOfDuty }

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
            export interface Callback { (res:API.CallOfDuty.Res.Warzone.Matches):void }
        }
    }
}