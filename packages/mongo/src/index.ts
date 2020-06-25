import { MongoClient } from 'mongodb'
export * from './callofduty'

let config:T.Config
let mdbClient:MongoClient

export const Config = (cfg:T.Config) => config = cfg
export const Client = async () => {
    if (!config) throw new Error('MongoDB config not found')
    if (!mdbClient) mdbClient = new MongoClient(
        `mongodb+srv://${config.user}:${config.password}@${config.host}/${config.db}?retryWrites=true&w=majority`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    if (!mdbClient.isConnected()) {
        await mdbClient.connect()
        console.log('[+] Connected to MongoDB')
    }
    return mdbClient.db(config.db)
}

export namespace T {
    export type Client = MongoClient
    export interface Config {
        db:string
        host:string
        user:string
        password:string
    }
}
