import { MongoClient } from 'mongodb'
export namespace T {
    export type Client = MongoClient
    export interface Config {
        db:string
        host:string
        user:string
        password:string
    }
    export namespace CallOfDuty {
        export type Platform = 'ATV' | 'BTL' | 'XBL' | 'PSN'
        export namespace Schema {
            export interface Player extends Player.Scaffold {
                _id: string
                api: {
                    auth: {
                        sso: string
                        xsrf: string
                        atkn: string
                    }
                    next?: number
                    updated?: number
                    failures?: number
                }
            }
            export namespace Player {
                export interface Scaffold {
                    email?:string
                    profiles: {
                        [key:string]: string // [platform.tag]: username
                    }
                    api: {
                        auth: {
                            sso: string
                            xsrf: string
                            atkn: string
                        }
                    }
                }
            }
            export interface Platform {
                _id: string
                tag: T.CallOfDuty.Platform
                name: string
                api: string
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