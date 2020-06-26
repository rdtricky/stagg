import SocketIO from 'socket.io-client'
import config from '../config'
import { Profile } from './api'
import { Types, IndexedDB } from '../store'

// Socket.io listeners
console.log('Initializing Socket.io...')
const io = SocketIO(config.io.host)
    .on('connect', () => console.log('Socket.io connected'))

// console.log('%c Oh my heavens! ', 'background: #222; color: #bada55')
// console.log('%c', 'padding:28px 119px;line-height:100px;background:url() no-repeat;')

// Profile workers
const timeouts = {}
const profiles = {} // key: isBusy

const callbacks = {}
export const subscribeAll = (store:any, cb:Function) => {
    for(const profile of store.profiles) {
        callbacks[profile.key] = cb
        subscriber(store, profile)
    }
}

export const subscriber = async (store:any, profile:Types.Profile) => {
    clearTimeout(timeouts[profile.key])
    if (!profiles[profile.key]) {
        const matchIds = await IndexedDB.LoadMatchIds(profile) || []
        if (profiles[profile.key] === undefined) {
            profiles[profile.key] = true
            console.log(`Starting worker for ${profile.username}`)
            store.setProfileSyncDetails(profile, { status: Types.Profile.Status.Loading })
            console.log(`Starting ETL for ${profile.username}`)
            // const modules = { ex: new ExampleModule(profile) }
            store.setProfileSyncDetails(profile, { recorded: matchIds.length })
            console.log(`Found ${matchIds.length} matchIds in IndexedDB for ${profile.username}`)
            let loaded = 0
            let missing = 0
            const matches = {}
            const performances = {}
            for(const matchId of matchIds || []) {
                const match = await IndexedDB.LoadMatch(matchId)
                const performance = await IndexedDB.LoadPerformance(matchId, profile)
                if (match && performance) {
                    matches[match.matchId] = match
                    performances[performance.matchId] = performance
                    store.setProfileSyncDetails(profile, { loaded: ++loaded })
                } else {
                    store.setProfileSyncDetails(profile, { recorded: matchIds.length - ++missing })
                }
            }
            callbacks[profile.key](profile.key, matches, performances)
            setTimeout(() => {
                for(const i in matches) delete matches[i] // fix underlying mem leak
                for(const i in performances) delete performances[i]
            }, 2500)
        }
        await worker(store, profile, matchIds)
    }
    timeouts[profile.key] = setTimeout(() => subscriber(store, profile), config.http.refresh)
}
// Updates IDB and MobX in background
export const worker = async (store:any, profile:Types.Profile, matchIds:string[]) => {
    const { key, mode, platform, username } = profile
    const diff = await Profile.Compare({ mode, platform, username}, matchIds)
    if (!diff.length) {
        profiles[key] = false
        console.log(`No new matches for ${profile.username} found to download`)
        const status = !matchIds.length ? Types.Profile.Status.Created : Types.Profile.Status.Complete
        store.setProfileSyncDetails(profile, { status })
        return
    }
    const combinedMatchIds = [...matchIds]
    console.log(`Downloading ${diff.length} matches for ${profile.username}`)
    const transmissions = { matches: 0, performances: 0, last: 0 }
    let transmissionCheck = setInterval(() => {
        if (transmissions.matches === diff.length && transmissions.performances === diff.length) {
            console.log(`Download complete for ${profile.username}`)
            resetProfileWorker(Types.Profile.Status.Complete)
            return
        }
        const now = Math.floor(Date.now() / 1000)
        if (transmissions.last && now - transmissions.last > config.io.abandon / 1000) {
            io.emit('download.profile.abandoned')
            console.log(`Download abandoned for ${profile.username}`)
            resetProfileWorker(Types.Profile.Status.Abandoned)
            return
        }
    }, config.io.delay)
    const matches = {}
    const performances = {}
    const resetProfileWorker = async (status:Types.Profile.Status) => {
        // Clear profile.transmissions/status
        clearInterval(transmissionCheck)
        store.setProfileSyncDetails(profile, { status })
        subscriber(store, profile)
        const newMatchIds = [...new Set([...combinedMatchIds])]
        IndexedDB.SaveMatchIds({ key }, newMatchIds)
        store.setProfileSyncDetails(profile, { recorded: newMatchIds.length })
        callbacks[profile.key](profile.key, matches, performances)
        for(const i in matches) delete matches[i]
        for(const i in performances) delete performances[i]
        profiles[key] = false
        // delete profiles[key]
    }
    io.emit('download.profile', profile, diff)
    io.on('download.profile.match', (match:Types.Match) => {
        transmissions.matches++
        matches[match.matchId] = match
        IndexedDB.AddMatch(match)
        transmissions.last = Math.floor(Date.now() / 1000)
        store.setProfileSyncDetails(profile, { ...transmissions })
        combinedMatchIds.push(match.matchId)
    })
    io.on('download.profile.performance', (profile:Types.Profile, performance:Types.Performance) => {
        transmissions.performances++
        performances[performance.matchId] = performance
        IndexedDB.AddPerformance({ key }, performance)
        transmissions.last = Math.floor(Date.now() / 1000)
        store.setProfileSyncDetails(profile, { ...transmissions })
        combinedMatchIds.push(performance.matchId)
    })
    store.setProfileSyncDetails(profile, { status: Types.Profile.Status.Downloading, expected: diff.length })
}
