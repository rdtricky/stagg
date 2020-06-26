import { T as API } from '@stagg/api'
import { T as Mongo } from '@stagg/mongo'
import * as CallOfDuty from './callofduty'

export { CallOfDuty }
export namespace T {
    export namespace CallOfDuty {
        export interface Options {
            db?:Options.Database
            wait:number
            limit:number
            retry:number
            delay:number
            refetch:boolean
            timestamp:number
            perpetual:boolean
            logger:Function
            callback:Options.Callback
            timestampOffset:number
        }
        export namespace Options {
            export interface Callback { (res:API.CallOfDuty.Res.Warzone.Matches):void }
            export interface Database {
                config: Mongo.Config
                player?: { [key:string]: any }
            }
        }
    }
}