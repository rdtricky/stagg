// import * as Mongo from 'mongodb'
// import * as API from '@stagg/api'
import * as CallOfDuty from './callofduty'
export { CallOfDuty }

/*

db: stagg

accounts:
{
    _id
    email

    games: [{
        franchise
        title
        name
        auth
        scrape
        profiles
        
        kgp?
        friend?
        enemy?
        random?
    }]

    discord: {
        id
        shortcuts
    }

    stash: {
        email: []
        games: []
        discord: []
    }
}

<franchise>.<title>.
callofduty.modernwarfare.

*/
