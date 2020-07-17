import * as Mongo from 'mongodb'
import * as API from '@stagg/api'

export interface Player extends Player.Scaffold {
    _id: Mongo.ObjectID
    profiles: { [key: string]: string } // platform:username
    games: API.Schema.CallOfDuty.Game[]
    uno: string
    scrape: {
        updated: number
        failures: number
        timestamp: number
        rechecked?: number // last time initialization recheck was ran
    }
    discord?: string
    prevAuth?: Player.Auth[]
    prevEmails?: string[]
    initFailure?: boolean // true if titleIdentities was blank on init
    discordShortcuts?: { [key: string]: string } // shortcut: payload
}
export namespace Player {
    export interface Auth {
        sso: string
        xsrf: string
        atkn: string
    }
    export interface Scaffold {
        email: string
        auth: Auth
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
export namespace WZ {
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
        stats: Performance.Stats
        loadouts: Loadout[]
    }
    export namespace Performance {
        export interface Stats {
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
            xp: Stats.XP
        }
        export namespace Stats {
            export interface XP {
                misc: number
                medal: number
                match: number
                score: number
                bonus: number
                challenge: number
                total: number
            }
        }
    }
}

// Performances are player-specific
export namespace MP {
    export interface Performance {
        mapId: string //
        modeId: string //
        matchId: string //
        endTime: number //
        startTime: number //
        player: {
            _id: string
            team: string
            username: string
            clantag: string
        }
        stats: Performance.Stats
        loadouts: Loadout[]
        playlistName: string
        version: number 
        result: string
        winningTeam: string
        gameBattle: boolean
        team1Score: number
        team2Score: number
        isPresentAtEnd: boolean
        arena: boolean
        privateMatch: boolean
    }
    export namespace Performance {
        export interface Stats {
            rank: number //
            score: number //
            kills: number //
            deaths: number //
            assists: number //
            accurracy: number //
            shotsLanded: number //
            shotsMissed: number //
            executions: number 
            headshots: number
            longestStreak: number //
            timePlayed: number //
            weaponStats: Stats.Weapon[]
            killstreakStats: Stats.Killstreak[]
            xp: Stats.XP

            /*
            objectiveMedalModeDomSecureCount
            objectiveMedalModeXAssaultScore
            objectiveMedalModeDomSecureAssistScore
            objectiveMedalModeDomSecureBScore
            objectiveUavAssist
            objectiveCaptureKill

            objectiveKcFriendlyPickup
            objectiveKillConfirmed

            objectiveMedalModeXAssaultScore
            objectiveMedalModeHpSecureScore

            objectiveMedalScoreSsKillHoverJet // killstreak kills
            */
        }
        export namespace Stats {
            export interface XP {
                misc: number //
                medal: number //
                match: number //
                score: number //
                total: number //
            }
            export interface Weapon {
                weaponId: string
                hits: number
                kills: number
                headshots: number
                loadoutIndex: number
                shots: number
                startingWeaponXp: number
                deaths: number
                xpEarned: number
            }
            export interface Killstreak {
                killstreakId: string
                count: number
                // xp?
                // kills?
            }
        }
    }
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
        uno: string
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
