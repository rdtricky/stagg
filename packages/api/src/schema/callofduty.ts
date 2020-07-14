export type Mode = 'mp' | 'wz'
export type Game = 'mw' | 'bo4' | 'wwii'
export type Platform = 'uno' | 'battle' | 'psn' | 'xbl' | 'steam'
export interface Tokens {
    sso: string
    xsrf: string
    atkn: string
}
export namespace Res {
    export interface Identity {
        titleIdentities: {
            title: string // game name eg: bo4 / mw
            platform: Platform
            username: string
            activeDate: number
            activityType: 'wz'
        }[]
    }
    export interface Platforms {
        [key:string]: { // key is platform
            username: string
        }
    }
    export interface Friends {
        uno: Friend[]
        incomingInvitations: Friend[]
        outgoingInvitations: Friend[]
        blocked: Friend[]
        firstParty: {
            xbl: {
                username: string
                platform: Platform
                avatarUrlLarge: string
                avatarUrlLargeSsl: string
                status: {
                    online: boolean
                }
                identities?: {
                    uno: {
                        username: string
                        platform: Platform
                        accountId: string
                    }
                }
            }[]
        }
    }
    export interface Friend {
        username: string
        platform: Platform
        accountId: string
        status: {
            online: boolean
            curentTitleId?: 'mw' | 'bo4' // only in the "friends" and "firstParty" it seems
        }
    }
    export interface Loadout {
        primaryWeapon: Loadout.Weapon
        secondaryWeapon: Loadout.Weapon
        perks: { name: string }[]
        extraPerks: { name: string }[]
        killstreaks: { name: string }[]
        tactical: { name: string }
        lethal: { name: string }
    }
    export namespace Loadout {
        export interface Weapon {
            name: string
            label: string
            imageLoot: string
            imageIcon: string
            variant: string
            attachments: Weapon.Attachment[]
        }
        export namespace Weapon {
            export interface Attachment {
                name: string
                label: string
                image: string
            }
        }
    }
    export namespace Warzone {
        export interface Matches {
            summary: Summary
            matches: Match[]
        }
        export interface Summary {
            
        }
        export interface Match {
            utcStartSeconds: number
            utcEndSeconds: number
            map: string
            mode: string
            matchID: string
            draw: boolean
            privateMatch: boolean
            duration: number
            playlistName: string
            version: number
            gameType: string
            playerCount: number
            teamCount: number
            player: Match.Player
            playerStats: Match.PlayerStats
            rankedTeams: Match.Team[]
        }
        export namespace Match {
            export interface Player {
                team: string
                rank: number
                awards: {}
                username: string
                clantag: string
                uno: string
                loadout: Loadout[]
            }
            export interface Team {
                name: string
                placement: number
                time: number
                plunder: null
                players: Match.Team.Player[]
            }
            export namespace Team {
                export interface Player {
                    uno: string
                    username: string
                    clantag: string
                    platform: string
                    team: string
                    rank: number
                    result: null
                    playerStats: Player.Stats
                    loadouts: Loadout[]
                }
                export namespace Player {
                    export interface Stats {
                        rank: number
                        score: number
                        kills: number
                        deaths: number
                        kdRatio: number
                        damageDone: number
                        damageTaken: number
                        timePlayed: number
                        wallBangs: number
                        headshots: number
                        executions: number
                        assists: number
                        nearmisses: number
                        longestStreak: number
                        scorePerMinute: number
                        distanceTraveled: number
                        percentTimeMoving: number
                    }
                }
            }
            export interface PlayerStats {
                rank: number
                kills: number
                deaths: number
                kdRatio: number
                headshots: number
                assists: number
                executions: number
                wallBangs?: number
                nearmisses?: number
                damageDone: number
                damageTaken: number
                longestStreak: number
                scorePerMinute: number
                percentTimeMoving: number
                distanceTraveled: number
                timePlayed: number
                score: number
                miscXp: number
                medalXp: number
                matchXp: number
                scoreXp: number
                bonusXp: number
                totalXp: number
                challengeXp: number
                teamPlacement: number
                teamSurvivalTime: number
                gulagKills?: number
                gulagDeaths?: number
                objectiveReviver?: number
                objectiveTeamWiped?: number
                objectiveBrKioskBuy?: number
                objectiveBrCacheOpen?: number
                objectiveLastStandKill?: number
                objectiveTrophyDefense?: number
                objectiveDestroyedEquipment?: number
                objectiveBrDownEnemyCircle1?: number
                objectiveBrDownEnemyCircle2?: number
                objectiveBrDownEnemyCircle3?: number
                objectiveBrDownEnemyCircle4?: number
                objectiveBrDownEnemyCircle5?: number
                objectiveBrDownEnemyCircle6?: number
                objectiveBrDownEnemyCircle7?: number
                objectiveBrDownEnemyCircle8?: number
                objectiveBrMissionPickupTablet?: number
                objectiveMunitionsBoxTeammateUsed?: number
                objectiveManualFlareMissileRedirect?: number
                objectiveMedalScoreKillSsRadarDrone?: number
                objectiveMedalScoreSsKillTomaStrike?: number
            }
        }
        // Warzone Profile
        export interface Profile {
            level: number
        }
    }
    export namespace Multiplayer {
        export interface Matches {

        }
        export interface Summary {

        }
        export namespace Match {
            export interface Player extends Warzone.Match.Player {
                nemesis: string
                mostKilled: string
                killstreakUsage: {
                    pac_sentry: number          // Wheelson
                    hover_jet: number           // VTOL
                    chopper_gunner: number      // Chopper Gunner
                }
            }
        }
    }
}