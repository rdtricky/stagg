import { Client } from '.'

export const Platforms = [
    {
        tag: 'ATV',
        api: 'uno',
        name: 'Activision'
    },
    {
        tag: 'BTL',
        api: 'battle',
        name: 'Battle.net'
    },
    {
        tag: 'XBL',
        api: 'xbl',
        name: 'Xbox Live'
    },
    {
        tag: 'PSN',
        api: 'psn',
        name: 'PlayStation Network'
    },
] as T.Schema.Platform[]

export const Bootstrap = async () => {
    const mongo = await Client()
    for(const platform of Platforms) {
        if (!await Get.Platform(platform.tag)) {
            await mongo.collection('platforms').insertOne(platform)
        }
    }
}

export namespace Get {
    export const Auth = async (username:string='', platform:T.Platform='ATV') => {
        if (username) {
            const player = await Player(username, platform)
            if (player?.api?.auth)
                return player.api.auth
        }
        const mongo = await Client()
        const { api: { auth } } = await mongo.collection('players').findOne({})
        return auth
    }
    export const Player = async (username:string, platform:T.Platform):Promise<T.Schema.Player> => {
        const mongo = await Client()
        return mongo.collection('players').findOne({ [`profiles.${platform.toUpperCase()}`]: { $regex: username, $options: 'i' } })
    }
    export const Platform = async (platformTag:T.Platform):Promise<T.Schema.Platform> => {
        const mongo = await Client()
        return mongo.collection('platforms').findOne({ tag: { $regex: platformTag, $options: 'i' } })
    }
    export namespace Warzone {
        export const MatchIds = async (username:string, platform:T.Platform, matchIds?:string[]):Promise<string[]> => {
            const mongo = await Client()
            const player = await Player(username, platform)
            if (!player) {
                return []
            }
            const props = { _id: 0, matchId: 1 } as any
            const query = { "player._id": player._id } as any
            if (matchIds) {
                query.matchId = { $nin: matchIds }
            }
            const performanceMatchIds = await mongo.collection('performances.wz').find(query, props).toArray()
            return performanceMatchIds.map(p => p.matchId)
        }
        export const Performances = async (username:string, platform:T.Platform, matchIds?:string[]):Promise<T.Schema.Performance[]> => {
            const mongo = await Client()
            const player = await Player(username, platform)
            if (!player) {
                return []
            }
            return !matchIds 
                ? mongo.collection('performances.wz').find({ "player._id": player._id }).toArray()
                : mongo.collection('performances.wz').find({ "player._id": player._id, matchId: { $in: matchIds } }).toArray()
        }
    }
}

export namespace Put {
    export const Player = async (player:T.Schema.Player.Scaffold) => {
        const mongo = await Client()
        return mongo.collection('players').insertOne(player)
    }
}

export namespace T {
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
            tag: T.Platform
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
