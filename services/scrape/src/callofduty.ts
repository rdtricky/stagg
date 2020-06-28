import { delay, timestamp } from '@stagg/util'
import * as Scrape from '@stagg/scrape'
import { T as Mongo } from '@stagg/mongo'
import * as DataSources from '@stagg/datasources'
import cfg from './config'

export const updateExistingPlayers = async (db:Mongo.Db) => {
    while(true) {
        const [ player ] = await db.collection('players')
            .find({ 'scrape.updated': { $exists: true, $lt: timestamp() - cfg.scrape.cooldown } })
            .sort({ 'scrape.updated': 1 }).toArray()
        if (!player) continue
        await update(player)
    }
}
export const initializeNewPlayers = async (db:Mongo.Db) => {
    while(true) {
        const player = await db.collection('players').findOne({ profiles: { $exists: false } })
        if (!player) continue
        const { games, profiles } = await updateIdentity(player, db) // required on initialize
        player.games = games
        player.profiles = profiles
        await initialize(player, db)
        await delay(cfg.scrape.wait)
    }
}
export const recheckExistingPlayers = async (db:Mongo.Db) => {
    while(true) {
        const [ player ] = await db.collection('players')
            .find({ 'scrape.updated': { $exists: true, $lt: timestamp() - cfg.scrape.cooldown } })
            .sort({ 'scrape.updated': 1 }).toArray()
        if (!player) continue
        const { games, profiles } = await updateIdentity(player, db) // optional on recheck (checks for new games)
        player.games = games
        player.profiles = profiles
        await recheck(player)
        await delay(cfg.scrape.wait)
    }
}

export const update = async (player:Mongo.CallOfDuty.Schema.Player) => {
    console.log(`[+] Initializing new update scraper for ${player.email}`)
    const Scraper = new Scrape.CallOfDuty.Warzone(player, { start: 0, redundancy: false })
    return Scraper.Run(cfg.mongo)
}
export const recheck = async (player:Mongo.CallOfDuty.Schema.Player) => {
    console.log(`[+] Initializing new recheck scraper for ${player.email}`)
    const Scraper = new Scrape.CallOfDuty.Warzone(player, { start: 0, redundancy: true })
    return Scraper.Run(cfg.mongo)
}
export const initialize = async (player:Mongo.CallOfDuty.Schema.Player, db:Mongo.Db) => {
    console.log(`[+] Initializing new initializer scraper for ${player.email}`)
    // Now update db and scrape
    const start = player.scrape?.timestamp || 0
    const Scraper = new Scrape.CallOfDuty.Warzone(player, { start, redundancy: false })
    await Scraper.Run(cfg.mongo)
}

export const updateIdentity = async (player:Mongo.CallOfDuty.Schema.Player, db:Mongo.Db) => {
    const games:string[] = []
    const profiles:{[key:string]:string} = {}
    const API = new DataSources.CallOfDuty(player.auth)
    const identity = await API.Identity()
    for(const identifier of identity.titleIdentities) {
        games.push(identifier.title)
        profiles[identifier.platform] = identifier.username
    }
    const platforms = await API.Platforms(Object.values(profiles)[0], Object.keys(profiles)[0] as DataSources.T.CallOfDuty.Platform)
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
