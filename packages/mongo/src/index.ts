import { MongoClient } from 'mongodb'
import { CallOfDuty } from './callofduty'
import { T } from './index.d'

let config:T.Config
let mdbClient:MongoClient
console.log('--------------\n--------------\n--------------\n--------------\n--------------')

export { CallOfDuty }
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
