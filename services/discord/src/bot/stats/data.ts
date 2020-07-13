import * as Discord from 'discord.js'
import * as Mongo from '@stagg/mongo'
import { mdb, msg } from '..'

// const aggr = await db.collection('performances.wz').aggregate([
//     { $match: { 'player._id': player._id } },
//     { $sort: { startTime: -1 } },
//     { $group: {
//         _id: { finishPos: '$stats.teamPlacement', mode: '$modeId' },
//         games: { $sum: 1 },
//         kills: { $sum: '$stats.kills' },
//         deaths: { $sum: '$stats.deaths' },
//     } },
//     { $limit: 50 },
// ], { cursor: { batchSize: 1 } }).toArray()

export const findPlayer = async (m:Discord.Message, username:string, platform?:string) => {
    return username !== 'me'
        ? await mdb.findPlayer({ username, platform })
        : await mdb.findPlayer({ discord: m.author.id })
}

export const isolatedStat = async (player:Mongo.Schema.CallOfDuty.Player, stat:string, modeIds:string[]=[], sort?:'time'|'best', limit:number=25) => {
    const db = await Mongo.client()
    const modeIdOp = !modeIds || !modeIds.length ? '$nin' : '$in'
    return db.collection('performances.wz').aggregate([
        { $match: { 'player._id': player._id, modeId: { [modeIdOp]: modeIds || [] } } },
        {
            $group: {
                _id: '$startTime',
                [stat]: { $sum: `$stats.${stat}` },
            }
        },
        { $sort: { _id: -1 } },
        { $limit: limit },
    ]).toArray()
}
export const ratioStat = async (player:Mongo.Schema.CallOfDuty.Player, stat:string, modeIds:string[]=[], sort?:'time'|'best', limit:number=25) => {
    const db = await Mongo.client()
    const modeIdOp = !modeIds || !modeIds.length ? '$nin' : '$in'
    const [dividend, divisor] = stat.split('/')
    return db.collection('performances.wz').aggregate([
        { $match: { 'player._id': player._id, modeId: { [modeIdOp]: modeIds || [] } } },
        {
            $group: {
                _id: '$startTime',
                divisor: { $sum: `$stats.${divisor}` },
                dividend: { $sum: `$stats.${dividend}` },
            }
        },
        {
            $project : {
                _id : "$_id",
                [stat] : { $cond: [ { $eq: [ "$divisor", 0 ] }, "$dividend", {"$divide":["$dividend", "$divisor"]} ] }
            }
        },
        { $sort: { _id: -1 } },
        { $limit: limit },
    ]).toArray()
}

export const statsReportByMode = async (player:Mongo.Schema.CallOfDuty.Player, modeIds:string[]=[], groupByModeId=false) => {
    const db = await Mongo.client()
    // if we're fetching "all" _id should be $modeId
    // if we're fetching anything else we should aggregate them all together
    const modeIdOp = !modeIds || !modeIds.length ? '$nin' : '$in'
    return db.collection('performances.wz').aggregate([
        { $match: { 'player._id': player._id, modeId: { [modeIdOp]: modeIds || [] } } },
        { $sort: { startTime: -1 } },
        { $group: {
            _id: groupByModeId ? '$modeId' : null,
            games: { $sum: 1 },
            score: { $sum: '$stats.score' },
            kills: { $sum: '$stats.kills' },
            deaths: { $sum: '$stats.deaths' },
            damageDone: { $sum: '$stats.damageDone' },
            damageTaken: { $sum: '$stats.damageTaken' },
            teamWipes: { $sum: '$stats.teamWipes' },
            eliminations: { $sum: '$stats.eliminations' },
            timePlayed: { $sum: '$stats.timePlayed' },
            distanceTraveled: { $sum: '$stats.distanceTraveled' },
            percentTimeMoving: { $sum: '$stats.percentTimeMoving' },
            // downs: { $sum: { $reduce: { input: '$stats.downs', initialValue: 0, in: { $add : ["$$value", "$$this"] } } } },
            gulagWins: {
                $sum: {
                    $switch: { 
                        branches: [ 
                            { 
                                case: { $gt: [ "$stats.gulagKills", 0 ] }, 
                                then: 1
                            }
                        ], 
                        default: 0
                    }
                }
            },
            gulagGames: {
                $sum: {
                    $switch: { 
                        branches: [
                            { 
                                case: { $gt: [ "$stats.gulagKills", 0 ] }, 
                                then: 1
                            },
                            { 
                                case: { $gt: [ "$stats.gulagDeaths", 0 ] }, 
                                then: 1
                            }
                        ], 
                        default: 0
                    }
                }
            },
            wins: {
                $sum: {
                    $switch: { 
                        branches: [ 
                            { 
                                case: { $eq: [ "$stats.teamPlacement", 1 ] }, 
                                then: 1
                            }
                        ], 
                        default: 0
                    }
                }
            },
            top5: {
                $sum: {
                    $switch: { 
                        branches: [ 
                            { 
                                case: { $lt: [ "$stats.teamPlacement", 6 ] }, 
                                then: 1
                            }
                        ], 
                        default: 0
                    }
                }
            },
            top10: {
                $sum: {
                    $switch: { 
                        branches: [ 
                            { 
                                case: { $lt: [ "$stats.teamPlacement", 11 ] }, 
                                then: 1
                            }
                        ], 
                        default: 0
                    }
                }
            }
        } },
    ]).toArray()
}