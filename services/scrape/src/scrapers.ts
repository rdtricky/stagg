import { T as Mongo } from '@stagg/mongo'
import * as Scrape from '@stagg/scrape'
import cfg from './config'
export const update = async (player:Mongo.CallOfDuty.Schema.Player) => {
    const Scraper = new Scrape.CallOfDuty.Warzone(player, { start: 0, redundancy: false })
    return Scraper.Run(cfg.mongo)
}
export const recheck = async (player:Mongo.CallOfDuty.Schema.Player) => {
    const Scraper = new Scrape.CallOfDuty.Warzone(player, { start: 0, redundancy: true })
    return Scraper.Run(cfg.mongo)
}
export const initialize = async (player:Mongo.CallOfDuty.Schema.Player) => {
    const start = player.scrape?.timestamp || 0
    const Scraper = new Scrape.CallOfDuty.Warzone(player, { start, redundancy: false })
    return Scraper.Run(cfg.mongo)
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
