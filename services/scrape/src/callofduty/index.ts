import * as mdb from '@stagg/mongo'
import * as API from '@stagg/api'
import * as Scrape from './scraper'
import cfg from '../config'

mdb.config(cfg.mongo)

export const timestamp = () => Math.round(new Date().getTime()/1000)

export const updateExistingPlayers = async () => {
    const db = await mdb.client()
    while(true) {
        const [ player ] = await db.collection('players')
            .find({ 'scrape.updated': { $exists: true } })
            .sort({ 'scrape.updated': 1 }).toArray()
        if (!player) continue
        await update(player)
    }
}
export const initializeNewPlayers = async () => {
    const db = await mdb.client()
    while(true) {
        const player = await db.collection('players').findOne({ scrape: { $exists: false }, initFailure: { $exists: false } })
        if (!player) continue
        try {
            const { games, profiles } = await updateIdentity(player) // required on initialize
            player.games = games
            player.profiles = profiles
            await initialize(player)
            await Scrape.delay(cfg.scrape.wait)
        } catch(e) {
            // This can fail if they have no titleIdentities returned, so signal in the db to skip for now
            await db.collection('players').updateOne({ _id: player._id }, { $set: { initFailure: true } })
        }
    }
}
export const recheckExistingPlayers = async () => {
    const db = await mdb.client()
    while(true) {
        const neverRechecked = await db.collection('players').findOne({ 'scrape.rechecked': { $exists: false } })
        const [ player ] = neverRechecked ? [neverRechecked]
            : await db.collection('players')
                .find({ 'scrape.rechecked': { $exists: true, $lt: timestamp() - cfg.scrape.cooldown } })
                .sort({ 'scrape.rechecked': 1 }).toArray()
        if (!player) continue
        await db.collection('players').updateOne({ _id: player._id }, { $set: { 'scrape.rechecked': timestamp() } })
        try {
            const { games, profiles } = await updateIdentity(player) // optional on recheck (checks for new games)
            player.games = games
            player.profiles = profiles
            await recheck(player)
            await Scrape.delay(cfg.scrape.wait)
        } catch(e) {
            console.log('[!] Recheck failed for', player.email, e)
        }
    }
}

export const update = async (player:mdb.Schema.CallOfDuty.Player) => {
    console.log(`[+] Updating ${player.email}`)
    const Scraper = new Scrape.Warzone(player, { start: 0, redundancy: false })
    return Scraper.Run(cfg.mongo)
}
export const recheck = async (player:mdb.Schema.CallOfDuty.Player) => {
    console.log(`[+] Rechecking ${player.email}`)
    const Scraper = new Scrape.Warzone(player, { start: 0, redundancy: true })
    return Scraper.Run(cfg.mongo)
}
export const initialize = async (player:mdb.Schema.CallOfDuty.Player, ) => {
    console.log(`[+] Initializing ${player.email}`)
    // Now update db and scrape
    const start = player.scrape?.timestamp || 0
    const Scraper = new Scrape.Warzone(player, { start, redundancy: false })
    await Scraper.Run(cfg.mongo)
}

export const updateIdentity = async (player:mdb.Schema.CallOfDuty.Player, ) => {
    const db = await mdb.client()
    const games:string[] = []
    const profiles:{[key:string]:string} = {}
    const CallOfDutyAPI = new API.CallOfDuty(player.auth)
    const identity = await CallOfDutyAPI.Identity()
    for(const identifier of identity.titleIdentities) {
        games.push(identifier.title)
        profiles[identifier.platform] = identifier.username
    }
    const platforms = await CallOfDutyAPI.Platforms(Object.values(profiles)[0], Object.keys(profiles)[0] as API.Schema.CallOfDuty.Platform)
    for(const platform in platforms) {
        profiles[platform] = platforms[platform].username
    }
    await db.collection('players').updateOne({ _id: player._id }, { $set: { games, profiles }})
    return { games, profiles }
}

/*
    Scrape profiles!
    Scrape Multiplayer!

    Warzone Matches:
    Have one scraper that just does updates
    {
        start: 0,
        redundancy: false,
    }
    
    Have another scraper that just does initialization
    {
        start: <db> || 0,
        redundancy: false,
    }
    
    Have another scraper that just does redundancy checks
    {
        start: 0,
        redundancy: true,
    }
*/
