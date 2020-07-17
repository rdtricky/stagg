// import * as Mongo from 'mongodb'
// import * as API from '@stagg/api'
import * as CallOfDuty from './callofduty'
export { CallOfDuty }

/*

db: stagg

// can you get active voice channel from author of msg?
// Discord help page for full commands

players:
{
    _id
    url
    email
    origin: organic | kgp | friend | enemy | random
    access: public | members | friends | private
    games: []
    auth: {

    }
    profiles: {
        id: uno
        uno: string
    }
    scrape: {
        updated:   number
        failures:  number
        timestamp: number
        rechecked?: number // last time initialization recheck was ran
    }
    prev: {
        auth: []
        email: []
        discord: []
    }
    discord?: {
        id
        shortcuts
    }
}


*/
