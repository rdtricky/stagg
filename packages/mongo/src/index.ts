import * as Mongo from 'mongodb'
import { T as DataSources } from '@stagg/datasources'
import { CallOfDuty } from './callofduty'

let config:T.Config
let mdbClient:Mongo.MongoClient

export { CallOfDuty }
export const Config = (cfg:T.Config) => config = cfg
export const Client = async () => {
    if (!config) throw new Error('MongoDB config not found')
    if (!mdbClient) mdbClient = new Mongo.MongoClient(
        `mongodb+srv://${config.user}:${config.password}@${config.host}/${config.db}?retryWrites=true&w=majority`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    if (!mdbClient.isConnected()) {
        await mdbClient.connect()
        console.log(`[+] Connected to MongoDB ${config.host}/${config.db}`)
    }
    return mdbClient.db(config.db)
}

export namespace T {
    export type Db = Mongo.Db
    export type Client = Mongo.MongoClient
    export interface Config {
        db:string
        host:string
        user:string
        password:string
    }
    export namespace CallOfDuty {
        export namespace Schema {
            export interface Player extends Player.Scaffold {
                _id: Mongo.ObjectID
                uno: string
                games: DataSources.CallOfDuty.Game[]
                profiles: { [key:string] : string } // platform:username
                scrape: {
                    updated:   number
                    failures:  number
                    timestamp: number
                }
            }
            export namespace Player {
                export interface Scaffold {
                    email: string
                    auth: {
                        sso: string
                        xsrf: string
                        atkn: string
                    }
                }
            }
            export interface Loadout {
                primary: Loadout.Weapon
                secondary: Loadout.Weapon
                lethal: string
                tactical: string
                perks: string[]
                killstreaks: string[]
            }
            export namespace Loadout {
                export interface Weapon {
                    weapon: string
                    variant: number
                    attachments: string[]
                }
            }
            // Performances are player-specific
            export interface Performance {
                mapId: string
                modeId: string
                matchId: string
                endTime: number
                startTime: number
                player: {
                    _id: string
                    team: string
                    username: string
                    clantag: string
                }
                stats: {
                    rank: number
                    score: number
                    kills: number
                    deaths: number
                    downs: number[] // [circleIndex:circleDowns]
                    gulagKills: number
                    gulagDeaths: number
                    eliminations: number
                    damageDone: number
                    damageTaken: number
                    teamWipes: number
                    revives: number
                    contracts: number
                    lootCrates: number
                    buyStations: number
                    assists: number
                    executions: number
                    headshots: number
                    wallBangs: number
                    nearMisses: number
                    clusterKills: number
                    airstrikeKills: number
                    longestStreak: number
                    trophyDefense: number
                    munitionShares: number
                    missileRedirects: number
                    equipmentDestroyed: number
                    percentTimeMoving: number
                    distanceTraveled: number
                    teamSurvivalTime: number
                    teamPlacement: number
                    timePlayed: number
                    xp: {
                        misc: number
                        medal: number
                        match: number
                        score: number
                        bonus: number
                        challenge: number
                        total: number
                    }
                }
                loadouts: Loadout[]
            }
            // Matches are generic game records
            export interface Match {
                mapId: string
                modeId: string
                matchId: string
                endTime: number
                startTime: number
                teams: {
                    name: string
                    time: number
                    placement: number
                    players: Match.Player[]
                }[]
            }
            export namespace Match {
                export interface Player {
                    username: string
                    clantag: string
                    platform: string
                    rank: number
                    stats: Player.Stats
                    loadouts: Loadout[]
                }
                export namespace Player {
                    export interface Stats {
                        score: number
                        kills: number
                        deaths: number
                        assists: number
                        headshots: number
                        executions: number
                        damageDone: number
                        damageTaken: number
                        longestStreak: number
                        timePlayed: number
                        distanceTraveled: number
                        percentTimeMoving: number
                    }
                }
            }
        }
    }  
}  